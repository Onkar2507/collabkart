import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAhOc--zv3y50T0Wy3p08N0TQD1RJ4lHlM",
  authDomain: "collabkart-7aef1.firebaseapp.com",
  projectId: "collabkart-7aef1",
  storageBucket: "collabkart-7aef1.firebasestorage.app",
  messagingSenderId: "985688679059",
  appId: "1:985688679059:web:ac906dc5ea6fae2ddb6366"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);