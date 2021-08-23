import React from 'react';
import { FieldValue, firestore, auth, createUserProfileDocument } from '../../firebase';
import { collectIdsandDocs } from '../../utils/utilities';
import firebase from 'firebase/app';
import { storage } from '../../firebase';
import './createBusiness.scss';
import SimpleReactValidator from 'simple-react-validator';
import Resizer from 'react-image-file-resizer';
import TopBar from '../../components/navigation/topNavigation/topBar'
import Subscribe from '../../components/subscribe/Subscribe'
import { css } from "@emotion/core";
import ScaleLoader from "react-spinners/ScaleLoader"
import PlacesAutocomplete, {
	geocodeByAddress,
	getLatLng,
  } from 'react-places-autocomplete';
import { GeoFirestore } from 'geofirestore';
import {loadStripe} from '@stripe/stripe-js';
import Arrow from '../../styles/assets/down-arrow.png';
import BottomBar from '../../components/navigation/bottomNavigation/bottomBar'

class CreateBusiness extends React.Component {
	state = { 
		name: '',
		description: '',
		coordinates: [],
		photo: [],
		category: '',
		address: '',
		twitter: '',
		facebook: '',
		instagram: '',
		hours: '',
		email:'',
		website: '',
		location: {},
		city: '',
		state: '',
		zipCode: '',
		phoneNumber: '',
		coverPhoto: null,
		featurePhoto1: null,
		featurePhoto2: null,
		featurePhoto3: null,
		user: [],
		progress: 0,
		isSubscribed: false,
		showCreate: false,
		subscriptionPrices: [],
		userHasBusiness: false,
	}
	validator = new SimpleReactValidator({autoForceUpdate: this});
	_isMounted = false;
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
	unsubscribeFromSubscriptions = null;

	businessTypes = [ 'Restaurants', 'Beauty', 'Church', 'Education', 'Event Planning', 
		'Financial', 'Fitness', 'Graphic Design', 'Web Services', 'Videography', 'Photography',
		'Clothing', 'Printing Services', 'Car Wash', 'Real Estate', 'Coaching', 'Tattoo Artist',
		'Art', 'Barbershop', 'Mobile Repair' ].sort();

	componentDidMount = async () => {
		this._isMounted = true;

		this.unsubscribeFromAuth = auth.onAuthStateChanged( async userAuth => {
			if (userAuth) {
				const userRef = await createUserProfileDocument(userAuth)
				userRef.onSnapshot(snapshot => {
					if (this._isMounted) {
						this.setState({ user: {uid: snapshot.id, ...snapshot.data()}}, () => this.handle_user())
					}
				})
			} else {
				this.props.history.push('/login');
			}
		});
		
	}

	handle_user = () => {
		this.handle_userHasBusiness();
		this.handle_isUserSubscribed();
	}

	handle_isUserSubscribed = async () => {
		await firestore.collection('users')
			.doc(this.state.user.uid)
			.collection('subscriptions')
			.where('status', 'in', ['trialing', 'active'])
			.onSnapshot(async (snapshot) => {
				// In this implementation we only expect one active or trialing subscription to exist.
				if(!snapshot.docs[0]) return;
				const doc = await collectIdsandDocs(snapshot.docs[0]);
				this.setState({subscriptionInfo: doc})
			})

	}

	handle_userHasBusiness = () => {
		if (this.state.user.userBusinesses.length > 0) {
			this.setState({ userHasBusiness: true }, () => this.handle_getUserBusiness())
		}
	}

	handle_getUserBusiness = () => {
		firestore
			.collection('businesses')
			.doc(this.state.user.userBusinesses[0])
			.onSnapshot( async snapshot => {
			let selectedBusiness = await collectIdsandDocs(snapshot);
			console.log(selectedBusiness);
			if (selectedBusiness.empty) {
				console.log('No matching documents.');
				return;
				} else {
					this.setState({
						name: selectedBusiness.name,
						description: selectedBusiness.description,
						coordinates: selectedBusiness.coordinates,
						photo: selectedBusiness.photo,
						category: selectedBusiness.category,
						address: selectedBusiness.address,
						twitter: selectedBusiness.socialMedia?.twitter || '',
						facebook: selectedBusiness.socialMedia?.facebook || '',
						instagram: selectedBusiness.socialMedia?.instagram || '',
						hours: selectedBusiness.hours,
						email: selectedBusiness.email,
						website: selectedBusiness.socialMedia?.website || '',
						location: selectedBusiness.location,
						phoneNumber: selectedBusiness.phoneNumber,
						coverPhoto: selectedBusiness.coverPhoto,
						featurePhoto1: selectedBusiness.featurePhoto1,
						featurePhoto2: selectedBusiness.featurePhoto2,
						featurePhoto3: selectedBusiness.featurePhoto3,
						zipCode: selectedBusiness.zipCode,
					});
				}
			},
			(error) => {
					error.log(error);
		}); 
	}

	handleSubscriptions = async () => {
		const subscriptions = await firestore.collection('products').where('active', '==', true).get()
			.then((snapshot) => {
				console.log(snapshot);
				snapshot.forEach(async (doc) => {
					console.log(collectIdsandDocs(doc));
					const priceSnap = await doc.ref.collection('prices').get();
					priceSnap.docs.forEach((doc) => {
						const subscriptionPrices = collectIdsandDocs(doc);
						this.setState({ subscriptionPrices })
						console.log(subscriptionPrices);
					});
					return priceSnap
				});
			})
		this.setState({ subscriptions })
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
		if (event.target.name === 'phoneNumber') {
			
			this.setState(prevState => ({ phoneNumber: this.normalizeInput(phoneNumber, prevState.businessPhone) }));
		} else {
			this.setState({[event.target.name]: event.target.value})
		}
	}

	handleAddressChange = (address) => {		
		this.setState({ address });
	}

	handleSelect = (selectedAddress) => {
		const splitAddress = selectedAddress.split(', ');
		const [ address, city, state, country ] = splitAddress;
		const businessLocation = {
			address,
			city,
			state,
			country
		}
		geocodeByAddress(selectedAddress)
			.then(results => getLatLng(results[0]))
			.then(latLng => this.setState({ selectedAddress, coordinates: latLng, businessLocation, city: businessLocation.city, state: businessLocation.state }))
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

	subscribeToHomeTeam = async () => {
		const stripePromise = loadStripe('pk_test_51HjT3BHrp1yZiedlk3GXPBcCTtE7OrL3nn3DZhrj0Jbj4eLZ4H69xLPmx2kPliARl50hJOEfHnv4GVM1aOEeBM4Q00hM0xQcDu');
		const stripe = await stripePromise;
		
		const docRef = await firestore
			.collection('users')
			.doc(this.state.user.uid)
			.collection('checkout_sessions')
			.add({
				price: 'price_1I7OQCHrp1yZiedl7mUHoPqV',
				success_url: `${window.location.origin}/create-business`,
				cancel_url: `${window.location.origin}/create-business`,
			});
			// Wait for the CheckoutSession to get attached by the extension
			docRef.onSnapshot((snap) => {
				const { error, sessionId } = snap.data();
				if (error) {
					// Show an error to your customer and 
					// inspect your Cloud Function logs in the Firebase console.
					alert(`An error occured: ${error.message}`);
				}
				if (sessionId) {
					// We have a session, let's redirect to Checkout
					// Init Stripe
					stripe.redirectToCheckout({ sessionId })
						.then((response) => {
							console.log(response);
						})
				}
			});
	}

	validate = () => {
		this.form.current.reportValidity();
	}


	get uid() { 
		return auth.currentUser.uid
	}

	get userRef() {
		return firestore.doc(`users/${this.uid}`);
	}

	get businessRef() {
		return firestore.doc(`businesses/${this.state.user.userBusinesses[0]}`);
	}

	addBusiness = async event => {
		event.preventDefault();
		if(!this.validator.allValid()){
			this.validator.showMessages()
			return;
		}
		const geofirestore = new GeoFirestore(firestore);
		const geocollection = geofirestore.collection('businesses');
		const { name,
			description,
			address,
			coordinates,
			category,
			email,
			twitter,
			facebook,
			instagram,
			phoneNumber,
			hours,
			coverPhoto,
			featurePhoto1,
			featurePhoto2,
			featurePhoto3,
			website,
			zipCode,
			location } = this.state;
		
		const { uid, displayName, photoURL } = auth.currentUser || {};

		const business = {
			name,
			description,
			address,
			email,
			phoneNumber,
			coverPhoto,
			featurePhoto1,
			featurePhoto2,
			featurePhoto3,
			location,
			likes: [],
			upvotes: [],
			downvotes: [],
			socialMedia: {
				twitter: twitter || null,
				facebook: facebook || null,
				instagram: instagram || null,
				website: website || null,
			},
			category,
			hours,
			approved: false,
			zipCode,
			coordinates: new firebase.firestore.GeoPoint(coordinates.Rc, coordinates.Ac),
			user: {
				uid,
				displayName,
				photoURL,
			},
		}

		geocollection.add(business)
			.then((response) => {
				console.log(response.id);
				this.userRef.update({
					userBusinesses: FieldValue.arrayUnion(response.id),
				})
				.then(()=> {
					console.log('User Added New Business');
				})
				.catch((error)=> {
					console.error(error);
				})
				.finally(() => {
					// this.props.history.push('/home');
				})
			})
	}

	editBusiness = async event => {
		event.preventDefault();
		if(!this.validator.allValid()){
			this.validator.showMessages()
			return;
		}

		const { name,
			description,
			address,
			coordinates,
			category,
			email,
			twitter,
			facebook,
			instagram,
			phoneNumber,
			hours,
			coverPhoto,
			featurePhoto1,
			featurePhoto2,
			featurePhoto3,
			zipCode,
			website,
			location } = this.state;
		
			this.businessRef.update({ name,
				description,
				address,
				coordinates: new firebase.firestore.GeoPoint(coordinates.Rc, coordinates.Ac),
				category,
				email,
				socialMedia: {twitter, facebook, instagram, website},
				phoneNumber,
				hours,
				coverPhoto,
				featurePhoto1,
				featurePhoto2,
				featurePhoto3,
				location,
				zipCode,
			});
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

	toggleCreate = () => {	
		this.setState(prevState => ({
			showCreate: !prevState.showCreate
		  }));
	}

	componentWillUnmount = () => {
		this.unsubscribeFromAuth();
		this._isMounted = false;
	}

 	render(){
		
	  	const { name,
			address,
			description,
			category,
			twitter,
			facebook,
			instagram,
			email,
			website,
			phoneNumber,
			subscriptionInfo,
			showCreate,
			userHasBusiness,
			city,
			zipCode,
		} = this.state;

		const override = css`
		display: block;
		margin: 0 auto;
		border-color: red;`;

	return (
		<div data-testid='create-business-page' id="createBusiness">
			<TopBar user={this.state.user}/>
			{ showCreate ? 
				<button type="button" onClick={() => this.toggleCreate()}><img id='backArrow' src={Arrow} alt='back arrow'></img></button>
				: null
			}
			<h1 className="join">Join The HomeTeam</h1>
			{	showCreate ?
			<>
				<form onSubmit={() => this.addBusiness()}>
					<div>
						<label className="business-label" htmlFor="name">Business Name</label>
						<input
							className="business-input"
							placeholder="Type Your Business Name"
							type="text"
							name="name"
							value={name}
							onChange={this.handleChange}
							autoComplete="off"
							onBlur={() => this.validator.showMessageFor('name')}
							/>
						{
							this.validator.message('name', this.state.name, 'required')
						}
					</div>

					<label className="business-label" htmlFor="category">Business Category</label>
					<select
						className="business-input"
						name="category"
						value={ category }
						onChange={this.handleChange}
						autoComplete="off"
						onBlur={() => this.validator.showMessageFor('category')}
						>
						<option className="option-select" value="">Select a Category</option>
						{
							this.businessTypes.map((type, index) => {
							return <option key={index} value={type}>{type}</option>
							})
						}
					</select>
					{
						this.validator.message('category', this.state.category, 'required')
					}

					<label className="business-label" htmlFor="address">Business Address</label>
						<PlacesAutocomplete
							searchOptions={this.searchOptions}
							name="address"
							value={ address }
							onChange={this.handleAddressChange}
							onSelect={this.handleSelect}
							pattern={this.validations.address}
							highlightFirstSuggestion={true}
							>
							{({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
								<div className="address-container">
									<input className='business-input'
										{...getInputProps({
										placeholder: 'Where is your Business?',
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
											? { backgroundColor: 'rgba(239,95,36,1)', cursor: 'pointer', fontSize: '25px'}
											: { cursor: 'pointer', fontSize: '25px' };
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
							this.validator.message('address', this.state.address, 'required')
						}

					<label className="business-label" htmlFor="city">City</label>
					<input
						className="business-input"
						placeholder="Street Address"
						type="text"
						name="city"
						value={ city }
						onChange={this.handleChange}
						autoComplete="off"
					/>

					<label className="business-label" htmlFor="state">State</label>
					<input
						className="business-input"
						placeholder="Street Address"
						type="text"
						name="state"
						disabled={true}
						value="Florida"
						onChange={this.handleChange}
						autoComplete="off"
					/>

					<label className="business-label" htmlFor="zipCode">Zip Code</label>
					<input
						className="business-input"
						placeholder="Street Address"
						type="text"
						name="zipCode"
						value={zipCode}
						onChange={this.handleChange}
						autoComplete="off"
					/>

					<label className="business-label" htmlFor="phoneNumber">Phone Number</label>
					<input
						className="business-input"
						placeholder="What is your Business Number"
						type="tel"
						pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
						name="phoneNumber"
						value={ phoneNumber }
						onChange={this.handleChange}
						autoComplete="off"
					/>
					{
						this.validator.message('phoneNumber', this.state.phoneNumber, 'required')
					}

					<label className="business-label" htmlFor="description">Describe your Business</label>
					<textarea
						className=""
						placeholder="Tell us about your business ()."
						type="text"
						name="description"
						value={ description }
						onChange={this.handleChange}
						autoComplete="off"
						height="250px"
					/>
					{
						this.validator.message('description', this.state.description, 'required')
					}

					<h1>Upload a Cover Photo</h1>


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
							<ScaleLoader color={this.color} loading={this.state.loading} css={override} size={150} />
							<div className={`${this.state.coverPhoto ? '': 'hideUploadImage'}`}>
								{ this.state.coverPhoto ? <img src={ this.state.coverPhoto } alt="#" style={{ height: '80px', width: '80px'}}></img> : null }
							</div>
						</div>
						<div>
							<h6>Cover Image</h6>
						</div>
					</div>
					
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

					<label className="business-label" htmlFor="email">Business Email</label>
					<input
						className="business-input"
						placeholder="IE: john.doe@gmail.com"
						type="email"
						name="email"
						value={ email }
						onChange={this.handleChange}
						autoComplete="off"
						/>
					{
						this.validator.message('email', this.state.email, 'required')
					}

					<label className="business-label" htmlFor="website">Business Website</label>
					<input
						className="business-input"
						placeholder="IE: www.yourwebsite.com"
						type="url"
						name="website"
						value={ website }
						onChange={this.handleChange}
						autoComplete="off"
						/>

					<label className="business-label" htmlFor="twitter">Business Twitter</label>
					<input
						className="business-input"
						placeholder="IE: www.twitter.com/your_username"
						type="url"
						name="twitter"
						value={ twitter }
						onChange={this.handleChange}
						autoComplete="off"
						/>

					<label className="business-label" htmlFor="facebook">Business Facebook</label>
					<input
						className="business-input"
						placeholder="IE: www.facebook.com/your_businesspage"
						type="url"
						name="facebook"
						value={ facebook }
						onChange={this.handleChange}
						autoComplete="off"
						/>

					<label className="business-label" htmlFor="instagram">Business Instagram</label>
					<input
						className="business-input"
						placeholder="IE: www.instagram.com/your_username"
						type="url"
						name="instagram"
						value={ instagram }
						onChange={this.handleChange}
						autoComplete="off"
						/>

					{ this.state.userHasBusiness && this.state.userHasBusiness ?
						<button type="submit" 
							onClick={(event) => this.editBusiness(event)} 
							className="button">Edit Business
						</button>
						: 	
						<button type="submit" 
							onClick={(event) => this.addBusiness(event)} 
							className="button">Add Business
						</button>
					}
				</form>
				</>
				:
				<div className="subscribe-section">
					<Subscribe 
						subscribe = {this.subscribeToHomeTeam}
						isActive = {subscriptionInfo?.status}
						toggleCreate = {this.toggleCreate}
						user = {this.state.user}
						userHasBusiness = {userHasBusiness}
					/>
				</div>
				
			}
			<BottomBar />
		</div>
	)
  }
}

export default CreateBusiness
