import React from 'react';
import { firestore, auth, createUserProfileDocument } from '../../firebase';
import firebase from 'firebase/app';
import '../../App.scss';
import { storage } from '../../firebase';
import './createBusiness.scss';
import SimpleReactValidator from 'simple-react-validator';
import Resizer from 'react-image-file-resizer';

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
		businessTwitter: '',
		businessFacebook: '',
		businessInstagram: '',
		businessHours: '',
		businessEmail:'',
		businessWebsite: '',
		businessLocation: {},
		businessNumber: '',
		coverPhoto: null,
		featurePhoto1: null,
		featurePhoto2: null,
		featurePhoto3: null,
		user: [],
		progress: 0,
	}
	validator = new SimpleReactValidator({autoForceUpdate: this});

	southWest = new window.google.maps.LatLng( 25.484490, -80.468150 );
	northEast = new window.google.maps.LatLng( 26.679440, -80.036710 );
	hyderabadBounds = new window.google.maps.LatLngBounds( this.southWest, this.northEast );
	form = React.createRef();
	validations = {
		email: /^(([^<>()\\[\]\\.,;:\s@"]+(\.[^<>()\\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
		phone: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
		isURL: /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g,
	}

	normalizeInput = (value, previousValue) => {
		// return nothing if no value
		if (!value) return value; 
	  
		// only allows 0-9 inputs
		const currentValue = value.replace(/[^\d]/g, '');
		const cvLength = currentValue.length; 
	  
		if (!previousValue || value.length > previousValue.length) {
	  
		  // returns: "x", "xx", "xxx"
		  if (cvLength < 4) return currentValue; 
	  
		  // returns: "(xxx)", "(xxx) x", "(xxx) xx", "(xxx) xxx",
		  if (cvLength < 7) return `(${currentValue.slice(0, 3)}) ${currentValue.slice(3)}`; 
	  
		  // returns: "(xxx) xxx-", (xxx) xxx-x", "(xxx) xxx-xx", "(xxx) xxx-xxx", "(xxx) xxx-xxxx"
		  return `(${currentValue.slice(0, 3)}) ${currentValue.slice(3, 6)}-${currentValue.slice(6, 10)}`; 
		}
	  };

	searchOptions = {
		bounds: this.hyderabadBounds,
		radius: 2000,
		types: ['address'],
	}
	unsubscribeFromAuth = null; 
	businessTypes = [ 'Restaurants', 'Beauty', 'Church', 'Education', 'Event Planning', 
		'Financial', 'Fitness', 'Graphic Design', 'Web Services', 'Videography', 'Photography',
		'Clothing', 'Printing Services', 'Car Wash', 'Real Estate', 'Coaching', 'Tattoo Artist',
		'Art', 'Barbershop', 'Mobile Repair' ].sort();

	componentDidMount = async () => {
		this.unsubscribeFromAuth = auth.onAuthStateChanged( async userAuth => {
			if (userAuth) {
				const userRef = await createUserProfileDocument(userAuth)
				userRef.onSnapshot(snapshot => {
					this.setState({ user: {uid: snapshot.id, ...snapshot.data()} })
				})
			} else {
				this.props.history.push('/login');
			}			
		}); 

	}

	componentWillUnmount = () => {
		this.unsubscribeFromAuth();

	}
	handleUploadChange = async (event) => {
		event.preventDefault()
		let fileName = event.target.files[0].name;
		let targetName = event.target.name;		
		if (event.target.files[0]) {
			try {
                Resizer.imageFileResizer(
                event.target.files[0],
                300,
                300,
                'JPEG',
                100,
                0,
                async (uri) => {
                    console.log(uri)
					await this.setState({ resizedPhoto: uri }, () => this.handleUpload(fileName, targetName))

                },
                'blob',
                200,
                200,
                );
            }   catch(err) {
                    console.log(err)
			}
		}
	}

	handleChange = (event) => {
		let phoneNumber = event.target.value;
		event.preventDefault();
		if (event.target.name === 'businessNumber') {
			console.log('run');
			
			this.setState(prevState => ({ businessNumber: this.normalizeInput(phoneNumber, prevState.businessPhone) }));
		} else {
			this.setState({[event.target.name]: event.target.value})
		}
	}

	handleAddressChange = (businessAddress) => {
		console.log(businessAddress);
		
		this.setState({ businessAddress });

	}

	handleSelect = businessAddress => {
		const splitAddress = businessAddress.split(', ');
		const [ address, city, state, country ] = splitAddress;
		const businessLocation = {
			address,
			city,
			state,
			country
		}
		console.log(address, city, state, country);
		geocodeByAddress(businessAddress)
		.then(results => getLatLng(results[0]))
		.then(latLng => this.setState({ businessAddress, businessCoordinates: latLng, businessLocation }))
		.catch(error => console.error('Error', error));		
	};

	handleUpload = (fileName, targetName) => {
		const uploadTask = storage.ref(`images/${fileName}`).put(this.state.resizedPhoto);
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
					.child(fileName)
					.getDownloadURL()
					.then(url => {
						console.log(url);
						this.setState({ [targetName]: url })
					})
			}
		)
	}


	validate = () => {
		this.form.current.reportValidity();
	}

	addBusiness = async event => {
		event.preventDefault();
		if(!this.validator.allValid()){
			this.validator.showMessages()
			return;
		}
		const geofirestore = new GeoFirestore(firestore);
		const geocollection = geofirestore.collection('businesses');
		const { businessName,
			businessDescription,
			businessAddress,
			businessCoordinates,
			businessCategory,
			businessTwitter,
			businessFacebook,
			businessInstagram,
			businessNumber,
			businessHours,
			coverPhoto,
			featurePhoto1,
			featurePhoto2,
			featurePhoto3,
			businessWebsite,
			businessLocation } = this.state;
		
		const { uid, displayName, email, photoURL } = auth.currentUser || {};

		const business = {
			businessName,
			businessDescription,
			businessAddress,
			businessNumber,
			coverPhoto,
			featurePhoto1,
			featurePhoto2,
			featurePhoto3,
			businessLocation,
			likes: [],
			upvotes: [],
			downvotes: [],
			socialMedia: {
				twitter: businessTwitter || null,
				facebook: businessFacebook || null,
				instagram: businessInstagram || null,
				website: businessWebsite || null,
			},
			businessCategory,
			businessHours,
			coordinates: new firebase.firestore.GeoPoint(businessCoordinates.lat, businessCoordinates.lng),
			user: {
				uid,
				displayName,
				email,
				photoURL,
			},
		}

		geocollection.add(business)
			.then((response) => {
				console.log(response);
				// this.props.history.push('/home');
			})
			.catch(error => {
				console.error(error)
			})


	}

 	render(){
		
	  	const { businessName,
			businessAddress,
			businessDescription,
			businessCategory,
			businessTwitter,
			businessFacebook,
			businessInstagram,
			businessEmail,
			businessWebsite,
			businessNumber,
		} = this.state;
	return (
		<div id="createBusiness">
			<h1>Add Your Business</h1>
			<div>
				<form 
					onSubmit={() => this.addBusiness()}
				>
				<div className="name-photo-section">
					<div className="name-select-container">
						<div>
							<label className="business-label" htmlFor="businessName">Business Name</label>
							<input
								className="business-input"
								placeholder="Name of your Business"
								type="text"
								name="businessName"
								value={businessName}
								onChange={this.handleChange}
								autoComplete="off"
								onBlur={() => this.validator.showMessageFor('businessName')}
								/>
							{
								this.validator.message('businessName', this.state.businessName, 'required')
							}
						</div>

						<label className="business-label" htmlFor="businessCategory">Select a Category</label>
						<select
							className="business-input"
							placeholder="Category"
							name="businessCategory"
							value={ businessCategory }
							onChange={this.handleChange}
							autoComplete="off"
							onBlur={() => this.validator.showMessageFor('businessCategory')}
							>
							<option value="">Select a Category</option>
							{
								this.businessTypes.map((type, index) => {
								return <option key={index} value={type}>{type}</option>
								})
							}
						</select>
						{
							this.validator.message('businessCategory', this.state.businessCategory, 'required')
						}
					</div>
					<div className="photoUpload">
						<div className="upload-container">
							<label className={`${this.state.coverPhoto ? 'hideUploadImage': ''}`}>
								<input
									name="coverPhoto"
									type="file"
									onChange={this.handleUploadChange}
									autoComplete="off"
									/>
							</label>
							<div className={`${this.state.coverPhoto ? '': 'hideUploadImage'}`}>
								{ this.state.coverPhoto ? <img src={ this.state.coverPhoto } alt="#" style={{ height: '80px', width: '80px'}}></img> : null }
							</div>
						</div>
						<div>
							<h6>Upload Cover Image</h6>
						</div>
					</div>
				</div>

				<label className="business-label" htmlFor="businessAddress">Business Address</label>
					<PlacesAutocomplete
						searchOptions={this.searchOptions}
						name="businessAddress"
						value={ businessAddress }
						onChange={this.handleAddressChange}
						onSelect={this.handleSelect}
						pattern={this.validations.address}
						highlightFirstSuggestion={true}
						>
						{({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
							<div className="address-container">
								<input className='business-input'
									{...getInputProps({
									placeholder: 'Business Address',
									})}
								/>
								<div className="autocomplete-dropdown-container">
									{loading && <div>Loading...</div>}
									{suggestions.map((suggestion, index) => {
									const className = suggestion.active
										? 'suggestion-item--active'
										: 'suggestion-item';
									// inline style for demonstration purpose
									const style = suggestion.active
										? { backgroundColor: '#EF5F24', cursor: 'pointer', fontSize: '25px' }
										: { backgroundColor: 'white', cursor: 'pointer', fontSize: '25px' };
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
					{
						this.validator.message('businessAddress', this.state.businessAddress, 'required')
					}

					<label className="business-label" htmlFor="businessNumber">Phone Number</label>
					<input
						className="business-input"
						placeholder="Phone Number"
						type="tel"
						pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
						name="businessNumber"
						value={ businessNumber }
						onChange={this.handleChange}
						autoComplete="off"
					/>
					{
						this.validator.message('businessNumber', this.state.businessNumber, 'required')
					}

					<label className="business-label" htmlFor="businessDescription">Describe your Business</label>
					<input
						className="business-input"
						placeholder="Description"
						type="text"
						name="businessDescription"
						value={ businessDescription }
						onChange={this.handleChange}
						autoComplete="off"
					/>
					{
						this.validator.message('businessDescription', this.state.businessDescription, 'required')
					}
					
					<h1>Feature Photos</h1>

					<div className="feature-photos-container">
						<div className="upload-container">
							<label className={`${this.state.featurePhoto1 ? 'hideUploadImage': ''}`}>
								<input
									name="featurePhoto1"
									type="file"
									onChange={this.handleUploadChange}
									autoComplete="off"
									/>
							</label>
							<div className={`${this.state.featurePhoto1 ? '': 'hideUploadImage'}`}>
								{ this.state.featurePhoto1 ? <img src={ this.state.featurePhoto1 } alt="#" style={{ height: '80px', width: '80px'}}></img> : null }
							</div>
							<div>Upload Photo</div>
						</div>
						<div className="upload-container">
							<label className={`${this.state.featurePhoto2 ? 'hideUploadImage': ''}`}>
								<input
									name="featurePhoto2"
									type="file"
									onChange={this.handleUploadChange}
									autoComplete="off"
									/>
							</label>
							<div className={`${this.state.featurePhoto2 ? '': 'hideUploadImage'}`}>
								{ this.state.featurePhoto2 ? <img src={ this.state.featurePhoto2 } alt="#" style={{ height: '80px', width: '80px'}}></img> : null }
							</div>
							<div>Upload Photo</div>
						</div>
						<div className="upload-container">
							<label className={`${this.state.featurePhoto3 ? 'hideUploadImage': ''}`}>
								<input
									name="featurePhoto3"
									type="file"
									onChange={this.handleUploadChange}
									autoComplete="off"
									/>
							</label>
							<div className={`${this.state.featurePhoto3 ? '': 'hideUploadImage'}`}>
								{ this.state.featurePhoto3 ? <img src={ this.state.featurePhoto3 } alt="#" style={{ height: '80px', width: '80px'}}></img> : null }
							</div>
							<div>Upload Photo</div>
						</div>
					</div>

					<label className="business-label" htmlFor="businessEmail">Business Email</label>
					<input
						className="business-input"
						placeholder="IE: john.doe@gmail.com"
						type="email"
						name="businessEmail"
						value={ businessEmail }
						onChange={this.handleChange}
						autoComplete="off"
						/>
					{
						this.validator.message('businessEmail', this.state.businessEmail, 'required')
					}

					<label className="business-label" htmlFor="businessWebsite">Business Website</label>
					<input
						className="business-input"
						placeholder="IE: www.yourwebsite.com"
						type="url"
						name="businessWebsite"
						value={ businessWebsite }
						onChange={this.handleChange}
						autoComplete="off"
						/>

					<label className="business-label" htmlFor="businessTwitter">Business Twitter</label>
					<input
						className="business-input"
						placeholder="IE: www.twitter.com/your_username"
						type="url"
						name="businessTwitter"
						value={ businessTwitter }
						onChange={this.handleChange}
						autoComplete="off"
						/>

					<label className="business-label" htmlFor="businessFacebook">Business Facebook</label>
					<input
						className="business-input"
						placeholder="IE: www.facebook.com/your_businesspage"
						type="url"
						name="businessFacebook"
						value={ businessFacebook }
						onChange={this.handleChange}
						autoComplete="off"
						/>

					<label className="business-label" htmlFor="businessInstagram">Business Instagram</label>
					<input
						className="business-input"
						placeholder="IE: www.instagram.com/your_username"
						type="url"
						name="businessInstagram"
						value={ businessInstagram }
						onChange={this.handleChange}
						autoComplete="off"
						/>

					<button type="submit" onClick={(event) => this.addBusiness(event)} className="button">Add Business</button>
				</form>
			</div>
		</div>
	)
  }
}

export default CreateBusiness
