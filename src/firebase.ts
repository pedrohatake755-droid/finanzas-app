import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCANUYXEamJhcWum1OiWFedUQ0hdYd73yg",
  authDomain: "gen-lang-client-0623061646.firebaseapp.com",
  projectId: "gen-lang-client-0623061646",
  storageBucket: "gen-lang-client-0623061646.firebasestorage.app",
  messagingSenderId: "372496366667",
  appId: "1:372496366667:web:8f30f87586542d280a61ce"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);