import React from 'react';
import { firestore, auth, createUserProfileDocument, storage, signOut } from '../../firebase';
import './userProfile.scss';

class UserProfile extends React.Component {
	state = { 
		displayName: '',
		email: '', 
		photoURL: '',
		uid: '',
		progress: 0,
		photoReady: false,
		upload: false,
	}

	unsubscribeFromAuth = null;

	componentDidMount = async () => { 
		this.unsubscribeFromAuth = auth.onAuthStateChanged( async userAuth => {
			if (userAuth) {
				const userRef = await createUserProfileDocument(userAuth)
				userRef.onSnapshot(snapshot => {
					let user = {...snapshot.data()};
					let {displayName, email, photoURL} = user					
					this.setState({ displayName, email, photoURL, uid: snapshot.uid })
				})
			} else {
				this.props.history.push('/login');
			}			
		}); 


	}

	get uid() { 
		return auth.currentUser.uid
	}

	get userRef() {
		return firestore.doc(`users/${this.uid}`);
	}

	handleSubmit = event => {
		event.preventDefault()
		const { displayName, email, photoURL } = this.state

		if (displayName) {
			this.userRef.update({ displayName });
		}

		if (email) {
			this.userRef.update({ email });
		}

		if (photoURL) {
			this.userRef.update({ photoURL });
		}
	}

	handleChange = (event) => {
		this.setState({[event.target.name]: event.target.value})  
	}

	handleUploadChange = async (event) => {
		event.preventDefault()
		if (event.target.files[0]){
			console.log(event.target);
			
			await this.setState({ photo: event.target.files[0] })
			this.handleUpload();
		}
	}

	handleUpload = () => {
		const uploadTask = storage.ref(`images/${this.state.photo.name}`).put(this.state.photo);
		uploadTask.on(
			"state_changed",
			snapshot => {
				const progress = Math.round(
					( snapshot.bytesTransferred / snapshot.totalBytes) * 100
				)
				console.log(snapshot);
				this.setState({ progress: progress })
			},
			error => {
				console.log(error);
			},
			() => {
				storage
					.ref("images")
					.child(this.state.photo.name)
					.getDownloadURL()
					.then(url => {
						console.log(url);
						this.setState({ photoURL: url, photoReady: true })
					})
			}
		)
	}

	componentWillUnmount = () => {
		this.unsubscribeFromAuth();
	}

	render(){	
		return (
			<div id="userProfile">
				<h1>Edit Profile</h1>
				<form onSubmit={this.handleSubmit}>
					<div className="photo-upload-container">
						<img id="userPhoto" src={this.state.photoURL} alt="User"></img> 
						<label className='upload-image'>
							<input
								name="photoURL"
								placeholder="Photo"
								type="file"
								onChange={this.handleUploadChange}
								autoComplete="off"
								/>
							Upload Photo
						</label> 
					</div>
					<input
						placeholder="displayName"
						type="text"
						name="displayName"
						value={this.state.displayName}
						onChange={(e) => this.handleChange(e)}
						autoComplete="off"
					/>
					<input
						placeholder="Email"
						type="text"
						name="email"
						value={this.state.email}
						onChange={(e) => this.handleChange(e)}
						autoComplete="off"
					/>
				<button type="submit">Update</button>
				</form>
			<button className="signout-button" type="button" onClick={signOut}>Sign Out</button>

			</div>
		)
		
	}
}

export default UserProfile;