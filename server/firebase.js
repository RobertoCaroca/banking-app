// server/firebase.js
const admin = require("firebase-admin");
require('dotenv').config();

const serviceAccount = {
  projectId: process.env.PROJECT_ID,
  privateKeyId: process.env.PRIVATE_KEY_ID,
  privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
  clientEmail: process.env.CLIENT_EMAIL,
  clientId: process.env.CLIENT_ID,
  authUri: process.env.AUTH_URI,
  tokenUri: process.env.TOKEN_URI,
  authProviderX509CertUrl: process.env.AUTH_PROVIDER_X509_CERT_URL,
  clientC509CertUrl: process.env.CLIENT_X509_CERT_URL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

module.exports = admin;
