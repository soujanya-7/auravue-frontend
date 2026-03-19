const functions = require('firebase-functions');
const admin = require('firebase-admin');
const twilio = require('twilio');

admin.initializeApp();

// Twilio Credentials from the user
const accountSid = functions.config().twilio?.account_sid || process.env.TWILIO_ACCOUNT_SID;
const messagingServiceSid = functions.config().twilio?.messaging_service_sid || process.env.TWILIO_MESSAGING_SERVICE_SID;

exports.sendSosSms = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated (Optional but recommended)
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to send SOS signals.');
  }

  const { toPhone, messageBody } = data;

  if (!toPhone) {
    throw new functions.https.HttpsError('invalid-argument', 'The "toPhone" argument is required.');
  }

  // NOTE: In a real production app, never hardcode AuthTokens.
  // The user masked the token as [AuthToken]. You need to provide the real one by configuring Firebase functions:
  // firebase functions:config:set twilio.auth_token="YOUR_REAL_TOKEN"
  // For now, attempting to read from config or env:
  const token = functions.config().twilio?.auth_token || process.env.TWILIO_AUTH_TOKEN || '[AuthToken]';

  const client = twilio(accountSid, token);

  try {
    const result = await client.messages.create({
      messagingServiceSid: messagingServiceSid,
      body: messageBody || 'SOS: AuraVue Patient requires immediate assistance!',
      to: toPhone
    });
    
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('Twilio Error:', error);
    throw new functions.https.HttpsError('internal', 'Unable to send SMS via Twilio. Check server logs.');
  }
});

/**
 * Triggered whenever a new alert is added to a caregiver's sub-collection.
 * Sends a push notification to the caregiver's registered FCM tokens.
 */
exports.onAlertCreated = functions.firestore
  .document('caregivers/{caregiverId}/alerts/{alertId}')
  .onCreate(async (snapshot, context) => {
    const alertData = snapshot.data();
    const caregiverId = context.params.caregiverId;

    try {
      // 1. Fetch caregiver's FCM tokens
      const caregiverDoc = await admin.firestore().doc(`caregivers/${caregiverId}`).get();
      const fcmTokens = caregiverDoc.data()?.fcmTokens || [];

      if (fcmTokens.length === 0) {
        console.log(`No FCM tokens found for caregiver ${caregiverId}`);
        return null;
      }

      // 2. Construct the notification payload
      const payload = {
        notification: {
          title: `🆘 AuraVue Alert: ${alertData.type}`,
          body: alertData.message || 'Immediate attention required.',
          click_action: 'https://auravue-c8b99.web.app/dashboard',
          icon: 'https://auravue-c8b99.web.app/logo192.png'
        },
        data: {
          alertId: context.params.alertId,
          type: alertData.type
        }
      };

      // 3. Send to all tokens
      const response = await admin.messaging().sendToDevice(fcmTokens, payload);
      console.log(`Successfully sent ${response.successCount} notifications.`);

      // Optional: Cleanup expired tokens
      const tokensToRemove = [];
      response.results.forEach((result, index) => {
        const error = result.error;
        if (error) {
          console.error('Failure sending notification to', fcmTokens[index], error);
          if (error.code === 'messaging/invalid-registration-token' ||
              error.code === 'messaging/registration-token-not-registered') {
            tokensToRemove.push(fcmTokens[index]);
          }
        }
      });

      if (tokensToRemove.length > 0) {
        await admin.firestore().doc(`caregivers/${caregiverId}`).update({
          fcmTokens: admin.firestore.FieldValue.arrayRemove(...tokensToRemove)
        });
      }

      return null;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return null;
    }
  });

