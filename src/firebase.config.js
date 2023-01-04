import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDFs9TUjjK2LJxM6BpPeNyfuZL0Jq_nfng",
  authDomain: "house-marketplace-app-3fbff.firebaseapp.com",
  projectId: "house-marketplace-app-3fbff",
  storageBucket: "house-marketplace-app-3fbff.appspot.com",
  messagingSenderId: "1016532698591",
  appId: "1:1016532698591:web:7cd9c87f3071e82182706a"
};

// Initialize Firebase
initializeApp(firebaseConfig);

export const db = getFirestore();