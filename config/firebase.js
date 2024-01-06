import config from '../app.config';

const firebaseConfig = {
    apiKey: config.extra.apiKey,
    authDomain: config.extra.authDomain,
    projectId: config.extra.projectId,
    storageBucket: config.extra.storageBucket,
    messagingSenderId: config.extra.messagingSenderId,
    appId: config.extra.appId
};

module.exports = firebaseConfig;

// const fbConfig = {
//     // Your Firebase configuration goes here
//     apiKey: "AIzaSyDQ-5xNGOCRWfyBXT9BUmO2G1MK1C9zn3c",
//     authDomain: "gently-fix.firebaseapp.com",
//     projectId: "gently-fix",
//     storageBucket: "gently-fix.appspot.com",
//     messagingSenderId: "469251427539",
//     appId: "1:469251427539:web:269522d37385e47613d826",
//   };
