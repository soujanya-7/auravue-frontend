import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Haptics, NotificationType } from '@capacitor/haptics';
import { messaging, db } from '../firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

const VAPID_KEY = "BPM9j6_Lz-XyYvK-9O6Kz-8XvE8zYvK-9O6Kz-8XvE8zYv";

/**
 * Initializes and requests notification permissions for both Mobile (Capacitor) and Web
 */
export const requestNotificationPermission = async (userId, userType) => {
  try {
    // 1. Native Mobile (iOS & Android)
    if (Capacitor.isNativePlatform()) {
      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === 'prompt' || permStatus.receive === 'prompt-with-rationale') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive === 'granted') {
        await PushNotifications.register();

        // Listen for registration token
        PushNotifications.addListener('registration', async (token) => {
          console.log('✅ Native Push Token generated:', token.value);
          if (userId) {
            const userRef = doc(db, userType === 'patient' ? 'patients' : 'caregivers', userId);
            await updateDoc(userRef, {
              pushTokens: arrayUnion(token.value)
            }).catch(err => console.warn('Could not save native token to Firestore:', err));
          }
        });

        // Listen for incoming notifications in foreground
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('📬 Native Push Received:', notification);
          // Trigger urgent haptic vibration for emergency alerts
          try {
            Haptics.notification({ type: NotificationType.Error });
          } catch (e) {
            // Ignore if haptics unavailable
          }
        });

        return 'native-registered';
      } else {
        console.warn('❌ Native push notification permission denied.');
        return null;
      }
    }

    // 2. Web Browser Fallback (Firebase Web Messaging)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted' && messaging) {
        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (token && userId) {
          console.log('✅ Web FCM Token generated:', token);
          const userRef = doc(db, userType === 'patient' ? 'patients' : 'caregivers', userId);
          await updateDoc(userRef, {
            fcmTokens: arrayUnion(token)
          }).catch(err => console.warn('Could not save web FCM token to Firestore:', err));
          return token;
        }
      } else {
        console.warn('❌ Web notification permission denied or messaging unavailable.');
      }
    }
  } catch (error) {
    console.error('❌ Error initializing push notifications:', error);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log('📬 Foreground message received:', payload);
        resolve(payload);
      });
    }
  });

