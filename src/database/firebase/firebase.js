import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_APIKEY,
  authDomain: process.env.REACT_APP_AUTHDOMAIN,
  projectId: process.env.REACT_APP_PROJECTID,
  storageBucket: process.env.REACT_APP_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGINGSENDID,
  appId: process.env.REACT_APP_APPID,
  measurementId: process.env.REACT_APP_MEASUREMENTID
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)
const fireStorage = getStorage(app)
const fireMessage = getMessaging(app)
const auth = getAuth(app)
/* getToken(fireMessage, {
  vapidKey: "BNl_j16bvRf6DF7Lam4MGeY8wUwAZDFXU1UQ0rXdhpOF1WI0EpFx-PtqWuFCMzYDiVQK54oUz8Etx37ziMMhHE4"
}).then(data => {
  console.log('key (firebase.js)',data);
}).catch(err => {
  console.log(err);
}) */

export { firestore, fireStorage }
export default auth