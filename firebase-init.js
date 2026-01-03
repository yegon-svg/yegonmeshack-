// Initialize Firebase and provide simple auth helpers.
// NOTE: Replace the firebaseConfig values with your Firebase project values.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Create a new user, save profile in Firestore, persist to localStorage.
 * Throws on validation or Firebase errors.
 */
export async function signup({ email, password, fullname }) {
  if (!email || !password || !fullname) throw new Error('Missing fullname, email or password');
  if (password.length < 6) throw new Error('Password must be at least 6 characters');

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: fullname });

  await setDoc(doc(db, 'users', userCredential.user.uid), {
    fullname,
    email,
    createdAt: new Date().toISOString()
  });

  const userObj = { uid: userCredential.user.uid, email, fullname };
  localStorage.setItem('currentUser', JSON.stringify(userObj));
  return userObj;
}

/**
 * Sign in existing user and persist to localStorage.
 * Throws on missing fields or Firebase errors.
 */
export async function login({ email, password }) {
  if (!email || !password) throw new Error('Missing email or password');

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const u = userCredential.user;
  const userObj = { uid: u.uid, email: u.email, fullname: u.displayName || '' };
  localStorage.setItem('currentUser', JSON.stringify(userObj));
  return userObj;
}

/** Sign out and clear localStorage */
export async function logoutLocal() {
  await signOut(auth);
  localStorage.removeItem('currentUser');
}

export { auth, db };
