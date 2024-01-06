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
