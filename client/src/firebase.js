import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';
import { GeoFirestore } from 'geofirestore';
import Stripe from 'stripe';

const config = {
    apiKey: process.env.REACT_APP_APIKEY,
    authDomain: process.env.REACT_APP_AUTHDOMAIN,
    databaseURL: process.env.REACT_APP_DATABASEURL,
    projectId: process.env.REACT_APP_PROJECTID,
    storageBucket: process.env.REACT_APP_STORAGEBUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
    appId: process.env.REACT_APP_APPID,
  };
  
  // Initialize Firebase
firebase.initializeApp(config);

export const firestore = firebase.firestore();
export const auth = firebase.auth();
export const storage = firebase.storage();
export const FieldValue = firebase.firestore.FieldValue;
export const provider = new firebase.auth.GoogleAuthProvider();
export const providerFacebook = new firebase.auth.FacebookAuthProvider();


export const signInWithGoogle = () => auth.signInWithPopup(provider);
export const signInWithFacebook = () => auth.signInWithPopup(providerFacebook);

export const signOut = () => auth.signOut();

export const createUserProfileDocument = async (user, additionalInfo) => {
	// const getCustomClaimRole = async () => {
	// 	await firebase.auth().currentUser.getIdToken(true);
	// 	const decodedToken = await firebase.auth().currentUser.getIdTokenResult();
	// 	return decodedToken.claims.stripeRole;
	// }

	// console.log(user, getCustomClaimRole());

	if (!user) return

	const { displayName, email, photoURL} = user
	const userRef = firestore.doc( `users/${user.uid}`)
	const snapshot = await userRef.get()

	if (!snapshot.exists) {
		const createdAt = new Date();
		const favorites = [];
		try {
			await userRef.set({
				displayName,
				email,
				photoURL,
				createdAt,
				favorites,
				...additionalInfo
			})
		}

		catch (error) {
			console.error('Error creating user', error);
			
		}
	}
	
	return getUserDocument(user.uid)
}

export const getUserDocument = async uid => {
	if (!uid) return null;
	try {
		return firestore.collection('users').doc(uid)
		
	} catch (error) { 
		console.error('Error fetching user', error.message);

	}
} 

// Create a GeoCollection reference
export const geofirestore = new GeoFirestore(firestore);

export default firebase;
