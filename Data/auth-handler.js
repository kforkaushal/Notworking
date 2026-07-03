import { auth, db } from './firebase-client.js';
import supabase, { setSupabaseToken } from './supabase-client.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    getAdditionalUserInfo,
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/**
 * Sets the Supabase session using the Firebase JWT.
 * @param {import("firebase/auth").User} user - The Firebase user object.
 */
export async function setSupabaseSession(user) {
    try {
        const token = await user.getIdToken();
        // Manually set the token to bypass Supabase Auth (GoTrue) validation of RS256 signatures
        setSupabaseToken(token);
        console.log('Supabase token set successfully (manual override).');
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
 * @param {string} username
 */
export async function handleEmailPasswordSignUp(fullname, email, password, username) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Set Supabase session first to satisfy RLS policies
    await setSupabaseSession(firebaseUser);

    // Update Firebase Auth profile
    await updateProfile(firebaseUser, { displayName: fullname });

    // Create a document in Firestore
    const userDocRef = doc(db, "users", firebaseUser.uid);
    await setDoc(userDocRef, {
        displayName: fullname,
        username: username,
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
        username: username
    });
    if (supabaseError) throw supabaseError;

    return firebaseUser;
}

/**
 * Handles user login with email and password.
 * @param {string} email
 * @param {string} password
 * @param {boolean} rememberMe
 */
export async function handleEmailPasswordLogin(email, password, rememberMe) {
    const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistence);

    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Set the Supabase session immediately after login to prevent race conditions on the feed page.
    await setSupabaseSession(userCredential.user);

    return userCredential.user;
}

/**
 * Handles Google Sign-In for both login and sign-up.
 */
export async function handleGoogleAuth() {
    // Ensure the session persists across browser sessions for Google users.
    await setPersistence(auth, browserLocalPersistence);

    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Set Supabase session first to satisfy RLS policies
    await setSupabaseSession(user);

    // Double-check if complete profile already exists in Supabase
    let isNewUser = true;
    try {
        const { data: profile } = await supabase.from('profiles')
            .select('username')
            .eq('id', user.uid)
            .maybeSingle();

        // A user is considered existing if they have a username set
        if (profile && profile.username) {
            isNewUser = false;
        }
    } catch (e) {
        console.warn("Could not check if profile is complete in Supabase:", e);
    }

    return { user, isNewUser };
}

/**
 * Handles sending a password reset email.
 * @param {string} email
 */
export async function handlePasswordReset(email) {
    await sendPasswordResetEmail(auth, email);
}

/**
 * Uploads a file to a specific Supabase Storage bucket and path.
 * @param {string} bucket - The Supabase Storage bucket name.
 * @param {string} path - The path/filename for the new file.
 * @param {File} file - The file object to upload.
 * @returns {Promise<string>} The public URL of the uploaded file.
 */
export async function uploadFile(bucket, path, file) {
    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: true // Overwrite file if it exists
        });

    if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
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