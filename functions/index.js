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
