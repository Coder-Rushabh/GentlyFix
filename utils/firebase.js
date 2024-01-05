import * as firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyDQ-5xNGOCRWfyBXT9BUmO2G1MK1C9zn3c",
  authDomain: "gently-fix.firebaseapp.com",
  projectId: "gently-fix",
  storageBucket: "gently-fix.appspot.com",
  messagingSenderId: "469251427539",
  appId: "1:469251427539:web:269522d37385e47613d826"
};

// Initialize Firebase

let app;
if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app()
}

const auth = firebase.auth()

export { auth };