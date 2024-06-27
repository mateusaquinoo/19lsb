import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBLsMaXUu2q-ZivBkNOPIYAzO7t33lpNis',
  authDomain: 'lsbapp-6f4e1.firebaseapp.com',
  projectId: 'lsbapp-6f4e1',
  storageBucket: 'lsbapp-6f4e1.appspot.com',
  messagingSenderId: '690947287889',
  appId: '1:690947287889:web:9ac28e609cafa8d9c80170',
  measurementId: 'G-HZBLXXYQ1J',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, auth, storage };
