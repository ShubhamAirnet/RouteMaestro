const admin = require('firebase-admin');
const serviceAccount = require('./routemaestrodemo-firebase-adminsdk-z61ff-641aa72e44.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports=db;