import { initializeApp } from 'firebase/app';
import { initializeFirestore,persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyDaE2IaqGpzEhD4VFyLAkOjzUKW3HjSVQc",
  authDomain: "pagosash-eb95d.firebaseapp.com",
  projectId: "pagosash-eb95d",
  storageBucket: "pagosash-eb95d.firebasestorage.app",
  messagingSenderId: "578069020420",
  appId: "1:578069020420:web:0376703aa3997662d89a51"
};


const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
});

export const functions = getFunctions(app, 'southamerica-east1');