// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDJkwj31bOO08cxsYlHPqUvi9JChFr_cPY",
    authDomain: "we-notworking.firebaseapp.com",
    projectId: "we-notworking",
    storageBucket: "we-notworking.appspot.com",
    messagingSenderId: "768738291896",
    appId: "1:768738291896:web:c55d1b896c7946bf5c444d",
    measurementId: "G-5VTB19KMZJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); // Initialize the core app

// Initialize and export Firebase services
export const auth = getAuth(app); // Authentication
export const storage = getStorage(app); // Cloud Storage
export const db = getFirestore(app); // Firestore Database
