import { messaging, db } from '../firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

const VAPID_KEY = "BPM9j6_Lz-XyYvK-9O6Kz-8XvE8zYvK-9O6Kz-8XvE8zYv"; // Shared placeholder

export const requestNotificationPermission = async (userId, userType) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (token) {
        console.log('✅ FCM Token generated:', token);
        // Save token to user's Firestore document
        const userRef = doc(db, userType === 'patient' ? 'patients' : 'caregivers', userId);
        await updateDoc(userRef, {
          fcmTokens: arrayUnion(token)
        });
        return token;
      }
    } else {
      console.warn('❌ Notification permission denied.');
    }
  } catch (error) {
    console.error('❌ Error getting FCM token:', error);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('📬 Foreground message received:', payload);
      resolve(payload);
    });
  });
