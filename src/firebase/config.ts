import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "AIzaSyAESkvQnKA-4l9m0EK5QmxmjN5q6Bbu4lQ",
  authDomain: "online-laundry-application.firebaseapp.com",
  projectId: "online-laundry-application",
  storageBucket: "online-laundry-application.firebasestorage.app",
  messagingSenderId: "894134390646",
  appId: "1:894134390646:web:5acc57192bf3af3dd2f457",
  measurementId: "G-H9R046WVK2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;