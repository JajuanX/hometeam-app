import React, {createContext, useState} from 'react'
import { auth, createUserProfileDocument } from '../firebase'

export const UserContext = createContext()

export const UserProvider = (props) => {
	const [user, setUser] = useState(null);

	let unsubscribeFromAuth = auth.onAuthStateChanged( async userAuth => {
		if (userAuth) {
			const userRef = await createUserProfileDocument(userAuth)
			userRef.onSnapshot(snapshot => {
				setUser({ user: {uid: snapshot.id, ...snapshot.data()} })
			})
			
		} 			
	}); 

	return (
		<UserContext.Provider user={user}>
			{props.children}
		</UserContext.Provider>
	)
}