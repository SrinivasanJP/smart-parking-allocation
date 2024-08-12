import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"
const firebaseConfig = {
  apiKey: "AIzaSyAJV8hpZ-hNij0PCy6mh_6VbGBngwZqqoU",
  authDomain: "smart-parking-allocation.firebaseapp.com",
  databaseURL: "https://smart-parking-allocation-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-parking-allocation",
  storageBucket: "smart-parking-allocation.appspot.com",
  messagingSenderId: "827392840560",
  appId: "1:827392840560:web:5cc076af15f42fc823b5b5"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);