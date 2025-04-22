import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD8zCeTPSM4p_AwtBZ2jmy4CapWfrdxY3A",
    authDomain: "hci-ham-spotify.firebaseapp.com",
    projectId: "hci-ham-spotify",
    storageBucket: "hci-ham-spotify.appspot.com",
    messagingSenderId: "500892242462",
    appId: "1:500892242462:web:75a8cfebf953a7ae59d40f",
    measurementId: "G-BBSXWWB98N"
  };

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);