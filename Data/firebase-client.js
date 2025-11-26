import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBvAb0at9YH8WoaaO5DIRbYpn3ydEqQRCQ",
    authDomain: "notworking-59e69.firebaseapp.com",
    projectId: "notworking-59e69",
    storageBucket: "notworking-59e69.appspot.com",
    messagingSenderId: "784996834340",
    appId: "1:784996834340:web:06b3a78bee4ce8a348ccb1",
    measurementId: "G-LGV0PY71ZM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };