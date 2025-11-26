import { auth, db } from './firebase-client.js';
import supabase from './supabase-client.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    getAdditionalUserInfo,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/**
 * Sets the Supabase session using the Firebase JWT.
 * @param {import("firebase/auth").User} user - The Firebase user object.
 */
async function setSupabaseSession(user) {
    try {
        const token = await user.getIdToken();
        const { error } = await supabase.auth.setSession({ access_token: token });
        if (error) throw error;
        console.log('Supabase session set successfully.');
    } catch (error) {
        console.error('Error setting Supabase session:', error);
        throw error; // Re-throw to be caught by the caller
    }
}

/**
 * Handles user sign-up with email and password.
 * @param {string} fullname
 * @param {string} email
 * @param {string} password
 */
export async function handleEmailPasswordSignUp(fullname, email, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update Firebase Auth profile
    await updateProfile(firebaseUser, { displayName: fullname });

    // Create a document in Firestore
    const userDocRef = doc(db, "users", firebaseUser.uid);
    await setDoc(userDocRef, {
        displayName: fullname,
        email: firebaseUser.email,
        bio: "Thrilled to announce... nothing. Absolutely nothing. 🤡",
        skills: ["Sleeping all day", "Applying at 3AM", "Ghosted by HR"],
        experience: "No real experience yet — still collecting rejection letters 💌",
        badges: ["Master of excuses", "LinkedIn Scroller"],
        createdAt: serverTimestamp()
    });

    // Create a profile in Supabase
    const { error: supabaseError } = await supabase.from('profiles').insert({
        id: firebaseUser.uid,
        full_name: fullname,
        email: firebaseUser.email
    });
    if (supabaseError) throw supabaseError;

    // Set Supabase session and redirect
    await setSupabaseSession(firebaseUser);
    window.location.href = '../feed.html';
}

/**
 * Handles user login with email and password.
 * @param {string} email
 * @param {string} password
 */
export async function handleEmailPasswordLogin(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // The onIdTokenChanged listener in feed.html will handle the session and redirect.
    // For direct navigation after login, we can do it here too.
    await setSupabaseSession(userCredential.user);
    window.location.href = '../feed.html';
}

/**
 * Handles Google Sign-In for both login and sign-up.
 */
export async function handleGoogleAuth() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    const additionalInfo = getAdditionalUserInfo(result);
    const user = result.user;

    // If it's a new user, create their profiles
    if (additionalInfo.isNewUser) {
        console.log("New Google user, creating profiles in Firestore and Supabase...");
        
        // Create in Firestore
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            bio: "Just landed on NotWorking, ready to do nothing!",
            skills: ["Google Sign-In Pro"],
            experience: "Expert in clicking 'Allow' on popups.",
            badges: ["Early Adopter"],
            createdAt: serverTimestamp()
        });

        // Create in Supabase
        const { error: supabaseError } = await supabase.from('profiles').insert({
            id: user.uid,
            full_name: user.displayName,
            avatar_url: user.photoURL,
            email: user.email
        });
        if (supabaseError) throw supabaseError;
    }

    // Set Supabase session and redirect
    await setSupabaseSession(user);
    window.location.href = '../feed.html';
}

/**
 * Handles sending a password reset email.
 * @param {string} email
 */
export async function handlePasswordReset(email) {
    await sendPasswordResetEmail(auth, email);
}


/**
 * Displays an error message in a specified element.
 * @param {HTMLElement} element
 * @param {string} message
 */
export function displayError(element, message) {
    if (element) {
        element.textContent = message;
        element.classList.remove('hidden');
    }
}