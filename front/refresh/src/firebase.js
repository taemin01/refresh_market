// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyBdbXt1zOzU4mALhC_7VD-5cQBelVjKXbg",
    authDomain: "swproject-165b4.firebaseapp.com",
    databaseURL: "https://swproject-165b4-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "swproject-165b4",
    storageBucket: "swproject-165b4.appspot.com",
    messagingSenderId: "10063242551",
    appId: "1:10063242551:web:accde01c70ba4e6e7666b2",
    measurementId: "G-JN1YMZ1C86"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, set};