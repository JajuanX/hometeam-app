import React from 'react';
import { firestore, auth, createUserProfileDocument } from '../../firebase';
import firebase from 'firebase/app';
import '../../App.scss';
import TopBar from '../../components/navigation/topNavigation/topBar';
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
		user: [],
		progress: 0,
		photoReady: false,
	}
	validator = new SimpleReactValidator();

	southWest = new window.google.maps.LatLng( 25.484490, -80.468150 );
	northEast = new window.google.maps.LatLng( 26.679440, -80.036710 );
	hyderabadBounds = new window.google.maps.LatLngBounds( this.southWest, this.northEast );
	form = React.createRef();
	validations = {
		email: /^(([^<>()\\[\]\\.,;:\s@"]+(\.[^<>()\\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
		phone: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
		isURL: /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g,
	}

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
		this.setState({ photo: event.target.files[0] })
		event.preventDefault()
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
					await this.setState({ resizedPhoto: uri }, () => this.handleUpload())

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
		event.preventDefault();
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

	handleUpload = () => {
		const uploadTask = storage.ref(`images/${this.state.photo.name}`).put(this.state.resizedPhoto);
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


	validate = () => {
		this.form.current.reportValidity();
	}

	addBusiness = async event => {
		event.preventDefault();
		const geofirestore = new GeoFirestore(firestore);
		const geocollection = geofirestore.collection('businesses');
		const { businessName,
			businessDescription,
			businessAddress,
			businessPhoto,
			businessCoordinates,
			businessCategory,
			businessTwitter,
			businessFacebook,
			businessInstagram,
			businessHours,
			businessWebsite, } = this.state;
		
		const { uid, displayName, email, photoURL } = auth.currentUser || {};

		const business = {
			businessName,
			businessDescription,
			businessAddress,
			businessPhoto,
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
			likes: [],
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
			businessPhoto,
			businessTwitter,
			businessFacebook,
			businessInstagram,
			businessEmail,
			businessWebsite,
		} = this.state;
	return (
		<div id="createBusiness">
			<h1>Add Your Business</h1>
			<div>
				<form>
				<div className="name-photo-section">
					<div>
						<div>
							<input
								className="business-input"
								placeholder="Name of your Business"
								type="text"
								name="businessName"
								value={businessName}
								onChange={this.handleChange}
								autoComplete="off"
								maxLength="60"
								onBlur={() => this.validator.showMessageFor('businessName')}
								required
								/>
							{
								this.validator.message('businessName', this.state.businessName, 'required|max:3')
							}
						</div>
						<select
							className="business-input"
							placeholder="Category"
							name="businessCategory"
							value={ businessCategory }
							onChange={this.handleChange}
							autoComplete="off"
							required
							>
							{
								this.businessTypes.map((type, index) => {
								return <option key={index} value={type}>{type}</option>
								})
							}
						</select>
					</div>
					<div className="photoUpload">
						<div className="upload-container">
							<label className={`${this.state.photoReady ? 'hideUploadImage': ''}`}>
								<input
									name="businessPhoto"
									type="file"
									onChange={this.handleUploadChange}
									autoComplete="off"
									required
									/> rr
							</label>
							<div className={`${this.state.photoReady ? '': 'hideUploadImage'}`}>
								{ this.state.photoReady ? <img src={ businessPhoto } alt="#" style={{ height: '80px', width: '80px'}}></img> : null }
							</div>
						</div>
						<div>
							<h6>Upload Cover Image</h6>
						</div>
					</div>
				</div>

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
							<div>
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

					<input
						className="business-input"
						placeholder="Description"
						type="text"
						name="businessDescription"
						value={ businessDescription }
						onChange={this.handleChange}
						autoComplete="off"
						required
						/>

					<input
						className="business-input"
						placeholder="Your business email"
						type="email"
						name="businessEmail"
						value={ businessEmail }
						onChange={this.handleChange}
						autoComplete="off"
						required
						/>
					
					<input
						className="business-input"
						placeholder="Link to your business website"
						type="url"
						name="businessWebsite"
						value={ businessWebsite }
						onChange={this.handleChange}
						autoComplete="off"
						/>

					<input
						className="business-input"
						placeholder="Link to your Twitter page"
						type="url"
						name="businessTwitter"
						value={ businessTwitter }
						onChange={this.handleChange}
						autoComplete="off"
						/>

					<input
						className="business-input"
						placeholder="Link to your Facebook page."
						type="url"
						name="businessFacebook"
						value={ businessFacebook }
						onChange={this.handleChange}
						autoComplete="off"
						/>

					<input
						className="business-input"
						placeholder="Link to your Instagram page."
						type="url"
						name="businessInstagram"
						value={ businessInstagram }
						onChange={this.handleChange}
						autoComplete="off"
						/>
					<div onClick={(event) => this.addBusiness(event)} className="button">Add post</div>
				</form>
			</div>

			<TopBar />
		</div>
	)
  }
}

export default CreateBusiness
