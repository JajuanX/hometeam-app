import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

const config = {
    apiKey: "AIzaSyBOP9I40hk4CZ-oT_JFpbzJR9FK52_4mz0",
    authDomain: "hometeam-891a3.firebaseapp.com",
    databaseURL: "https://hometeam-891a3.firebaseio.com",
    projectId: "hometeam-891a3",
    storageBucket: "hometeam-891a3.appspot.com",
    messagingSenderId: "26724473528",
    appId: "1:26724473528:web:391eaee922b0e53811324d"
  };
  // Initialize Firebase
firebase.initializeApp(config);

export const firestore = firebase.firestore();
export const auth = firebase.auth();

export const provider = new firebase.auth.GoogleAuthProvider();
export const signInWithGoogle = () => auth.signInWithPopup(provider);
export const signOut = () => auth.signOut();

export default firebase;
