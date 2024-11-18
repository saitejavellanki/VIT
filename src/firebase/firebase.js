import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
	apiKey: "AIzaSyAoZmz0fkGS82GVhMg5iCVz7DRl6IfVjGU",
  authDomain: "vitify-be859.firebaseapp.com",
  projectId: "vitify-be859",
  storageBucket: "vitify-be859.appspot.com",
  messagingSenderId: "70352333540",
  appId: "1:70352333540:web:322e02071f8bec971a5af1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, firestore, storage };
