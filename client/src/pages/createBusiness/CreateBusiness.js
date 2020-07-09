import React from 'react'
import { firestore, auth } from '../../firebase'
import firebase from 'firebase/app';
import '../../App.css'
import '../../styles/businessTimeLine.css'
import TopBar from '../../components/navigation/topNavigation/topBar'
import { storage } from '../../firebase'
import './createBusiness.css'
import PlacesAutocomplete, {
	geocodeByAddress,
	getLatLng,
  } from 'react-places-autocomplete';
import { GeoFirestore } from 'geofirestore';

   

class CreateBusiness extends React.Component {
	state = { 
		businessName: '',
		businessDescription: '',
		businessCoordinates: [],
		businessPhoto: [],
		businessCategory: '',
		businessAddress: '',
		user: [],
		progress: 0,
		photoReady: false,
	}
	southWest = new window.google.maps.LatLng( 25.484490, -80.468150 );
	northEast = new window.google.maps.LatLng( 26.679440, -80.036710 );
	hyderabadBounds = new window.google.maps.LatLngBounds( this.southWest, this.northEast );
	
	searchOptions = {
		bounds: this.hyderabadBounds,
		types: ['address'],
		componentRestrictions: { country: 'us' }
	  }
	unsubscribeFromAuth = null; 
	businessTypes = [ 'Restaurants', 'Beauty', 'Church', 'Education', 'Event Planning', 
		'Financial', 'Fitness', 'Graphic Design', 'Web Services', 'Videography', 'Photography',
		'Clothing', 'Printing Services', 'Car Wash', 'Real Estate', 'Coaching', 'Tattoo Artist',
		'Art', 'Barbershop', 'Mobile Repair' ].sort();

	componentDidMount = async () => {
		this.unsubscribeFromAuth = auth.onAuthStateChanged( currentUser => {
			const { uid, displayName, email, photoURL } = currentUser;
			const user = {
				uid,
				displayName,
				email,
				photoURL,
			}
			this.setState({ user })
		}); 		

	}

	componentWillUnmount = () => {
		this.unsubscribeFromAuth();

	}
	handleUploadChange = (event) => {
		event.preventDefault()
		if (event.target.files[0]){
			this.setState({ photo: event.target.files[0] })

		}
	}

	handleChange = (event) => {
 		this.setState({[event.target.name]: event.target.value})  
	}
	handleAddressChange = (businessAddress) => {
		this.setState({ businessAddress });

	}

	handleSelect = businessAddress => {
		this.setState({ businessAddress });
		geocodeByAddress(businessAddress)
		.then(results => getLatLng(results[0]))
		.then(latLng => this.setState({ businessCoordinates: latLng }))
		.catch(error => console.error('Error', error));		
	};

	handleUpload = (event) => {
		event.preventDefault()
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
						this.setState({ businessPhoto: url, photoReady: true })
					})
			}
		)
	}

	addBusiness = async event => {
		event.preventDefault();
		const geofirestore = new GeoFirestore(firestore);
		const geocollection = geofirestore.collection('businesses');
		const { businessName, businessDescription, businessAddress, businessPhoto, businessCoordinates } = this.state;
		const { uid, displayName, email, photoURL } = auth.currentUser || {}
		console.log(businessCoordinates.lat, businessCoordinates.lng)
		const business = {
			businessName,
			businessDescription,
			businessAddress,
			businessPhoto,
			coordinates: new firebase.firestore.GeoPoint(businessCoordinates.lat, businessCoordinates.lng),
			user: {
				uid,
				displayName,
				email,
				photoURL,
			}
		}
		geocollection.add(business)
	}

  render(){
	  const { businessName, businessAddress, businessDescription, businessCategory, businessPhoto } = this.state;
	return (
		<div id="site">
			<div>
				<h1>Your Business Card</h1>
				<form onSubmit={ this.handleCreate }>
					<input
						className="input"
						placeholder="Title"
						type="text"
						name="businessName"
						value={businessName}
						onChange={this.handleChange}
						autoComplete="off"
						/>
					<br></br>
					<input
						className="input"
						placeholder="Description"
						type="text"
						name="businessDescription"
						value={ businessDescription }
						onChange={this.handleChange}
						autoComplete="off"
						/>
					<br></br>
					<select
						className="input"
						placeholder="Category"
						name="businessCategory"
						value={ businessCategory }
						onChange={this.handleChange}
						autoComplete="off"
						>
						{
							this.businessTypes.map((type, index) => {
							return <option key={index} value={type}>{type}</option>
							})
						}
					</select>
					<br></br>
					<input
						name="businessPhoto"
						className="input"
						placeholder="Photo"
						type="file"
						onChange={this.handleUploadChange}
						autoComplete="off"
						/>
					<div>{this.state.progress}</div>
					<div onClick={this.handleUpload} className="button">Upload</div>

					<div onClick={this.addBusiness} className="button">Add post</div>
				</form>
			</div>
			<PlacesAutocomplete
				searchOptions={this.searchOptions}
				name="businessAddress"
				value={ businessAddress }
				onChange={this.handleAddressChange}
				onSelect={this.handleSelect}
				>
				{({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
					<div>
					<input
						{...getInputProps({
						placeholder: 'Search Places ...',
						className: 'location-search-input',
						})}
					/>
					<div className="autocomplete-dropdown-container">
						{loading && <div>Loading...</div>}
						{suggestions.map(suggestion => {
						const className = suggestion.active
							? 'suggestion-item--active'
							: 'suggestion-item';
						// inline style for demonstration purpose
						const style = suggestion.active
							? { backgroundColor: '#fafafa', cursor: 'pointer' }
							: { backgroundColor: '#ffffff', cursor: 'pointer' };
						return (
							<div
							{...getSuggestionItemProps(suggestion, {
								className,
								style,
							})}
							>
							<span>{suggestion.description}</span>
							</div>
						);
						})}
					</div>
					</div>
				)}
			</PlacesAutocomplete>
			<div className="businessCard">
				<div>{ this.state.photoReady ? <img src={ businessPhoto } alt="#"></img> : null }</div>
				<div>{this.state.businessName}</div>
			</div>
			<TopBar />
		</div>
	)
  }
}

export default CreateBusiness
