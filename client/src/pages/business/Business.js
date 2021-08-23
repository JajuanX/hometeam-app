import React from 'react'
import { FieldValue, firestore, auth, createUserProfileDocument } from '../../firebase'
import './business.scss'
import { collectIdsandDocs } from '../../utils/utilities'
import BusinessIcon from '../../components/business-icons/BusinessIcon'
import GoogleMapReact from 'google-map-react';
import MapMarker from '../../styles/assets/location.png';
import Phone from '../../styles/assets/phone-call.png';
import EmptyHeart from '../../styles/assets/clearHeart.png';
import Heart from '../../styles/assets/heart.png';
import FaceBook from '../../styles/assets/social-media/facebookLogo.png';
import Instagram from '../../styles/assets/social-media/instagram.jpg';
import Web from '../../styles/assets/social-media/website.png';
import Twitter from '../../styles/assets/social-media/twitter.png';
import YouTube from '../../styles/assets/social-media/youtube.png';
import Email from '../../styles/assets/social-media/email.png';

// import ModalImage from "react-modal-image";
import QRCode from "react-qr-code";
import TopBar from '../../components/navigation/topNavigation/topBar'
import { formatPhoneNumber } from 'react-phone-number-input'
import BottomBar from '../../components/navigation/bottomNavigation/bottomBar'

class Business extends React.Component {
	state = { 
		selectedBusiness: {},
		user: [],
		userDownVoted: null,
		userUpVoted: null,
		userFavorite: false,
		reviewType: 'positive',
		disableReview: true,
		comment: '',
	}
	_isMounted = false;
	unsubscribeFromAuth = null; 
	unsubscribeFromBusiness = null;
	businessID = this.props.match.params.id;

	componentDidMount = () => {
		this._isMounted = true;

		this.unsubscribeFromAuth = auth.onAuthStateChanged( async userAuth => {			
			if (userAuth) {
				const userRef = await createUserProfileDocument(userAuth)
				userRef.onSnapshot(snapshot => {
					if (this._isMounted) {
						this.setState({ 
							user: {uid: snapshot.id, ...snapshot.data()} 
						}, this.handle_user_favorites)
					}
				})//todo: handle error for users not logged in 
			} else {
				this.setState({user: userAuth})
			}			
		});

		this.unsubscribeFromBusiness = firestore
			.collection('businesses')
			.doc(this.businessID)
			.onSnapshot( async snapshot => {
			let selectedBusiness = await collectIdsandDocs(snapshot);

			if (selectedBusiness.empty) {
				console.log('No matching documents.');
				return;
				} else {
					this.handle_selected_business(selectedBusiness);
				}
			return selectedBusiness;
			},
			(error) => {
					error.log(error);
		}); 
		
		
	}

	get uid() { 
		return auth.currentUser.uid
	}

	get userRef() {
		return firestore.doc(`users/${this.uid}`);
	}

	get businessRef() {
		return firestore.doc(`businesses/${this.businessID}`);
	}

	handle_user_favorites = () => {
		let userFavoriteBusiness = this.state.user.favorites.includes(this.businessID);

		if (userFavoriteBusiness) {
			this.setState({ userFavorite: true})
		}
	}

	handle_selected_business = (selectedBusiness) => {
		this.setState({ selectedBusiness })
	}

	handle_submit_comment = (event) => {
		event.preventDefault();
		const {comment, reviewType} = this.state;
		const { uid, displayName, email, photoURL } = this.state.user || {}
		const comments = {
		  comment ,
		  reviewType,
		  user: {
			uid,
			displayName,
			email,
			photoURL,
		  },
		}
		this.businessRef.update({
			comments: FieldValue.arrayUnion(comments),
			timestamp: FieldValue.serverTimestamp(),
		})			
		.then(()=> {
			console.log('Successful comment');
		})
		

	}

	// vote = (vote) => {
	// 	if (vote === "downvote") {
	// 		if(this.state.userDownVoted) return;
	// 		this.businessRef.update({
	// 			downvotes: FieldValue.arrayUnion(this.uid),
	// 			upvotes: FieldValue.arrayRemove(this.uid)
	// 		})
	// 		.then(()=> {
	// 			console.log('Success');
	// 			this.setState({ userDownVoted: true, userUpVoted: false })
	// 		})
	// 		.catch((error)=> {
	// 			console.error(error);
	// 		});
	// 	}

	// 	if (vote === "upvote") {
	// 		if(this.state.userUpVoted) return;
	// 		this.businessRef.update({
	// 			upvotes: FieldValue.arrayUnion(this.uid),
	// 			downvotes: FieldValue.arrayRemove(this.uid)
	// 		})
	// 		.then(()=> {
	// 			console.log('Success');
	// 			this.setState({ userUpVoted: true, userDownVoted: false})
	// 		})
	// 		.catch((error)=> {
	// 			console.error(error);
	// 		});
	// 	}
	// }

	handle_add_to_favorites = () => {
		this.setState(prevState => ({
			userFavorite: !prevState.userFavorite
		  }),() => this.setFavorite());
	}
	// There's a problem here!

	setFavorite = () => {
		if (this.state.userFavorite) {
			this.userRef.update({
				favorites: FieldValue.arrayUnion(this.businessID),
			})
			.then(()=> {
				console.log('User likes this business');
			})
			.catch((error)=> {
				console.error(error);
			});
		} else {
			this.userRef.update({
				favorites: FieldValue.arrayRemove(this.businessID)
			})
			.then(()=> {
				console.log('User dislikes this business');
			})
			.catch((error)=> {
				console.error(error);
			});
		}
	}

	addReview = (reviewType) => {
		let review
		switch (reviewType) {
			case 'positive':
				review = reviewType;
				break;
			case 'negative':
				review = reviewType;
				break;
			case 'neutral':
				review = reviewType;
				break;
			default:
				break;
		}

		this.setState({reviewType: review, disableReview: false})
		
	}

	componentWillUnmount = () => {
		this.unsubscribeFromAuth();
		this.unsubscribeFromBusiness();
		this._isMounted = false;

	}

	handleChange = (event) => {
 		this.setState({[event.target.name]: event.target.value})  
	}

  render(){
		const { 	
			category,
			address,
			phoneNumber,
			description,
			socialMedia,
			name,
			coverPhoto,
			featurePhoto1,
			featurePhoto2,
			featurePhoto3,
			coordinates,
		} = this.state.selectedBusiness;
		
		const location = {
			address: '4821 sw 23rd st West Park, FL 33023',
			lat: coordinates && coordinates.Rc,
			lng: coordinates && coordinates.Ac,
		}

		console.log(this.state.selectedBusiness.phoneNumber);
		
	return (
		<div data-testid='business-page' id="businessCard">
			<TopBar user={this.state.user}/>
			<div className="main-media-container section">
				<img className='cover-photo' src={coverPhoto} alt={name}></img>
				<div className="qrcode-container">
					{ this.state.selectedBusiness && this.state.selectedBusiness.socialMedia ?
						<QRCode value={this.state.selectedBusiness?.socialMedia?.website} size={150} />: null
					}
				</div>
			</div>
			<div className="business-info-container section">
				<h3 id="business-name">{name}</h3>
				<div className="address-container">
					<img src={MapMarker} alt="Map Marker"></img>
					<a target="_blank" 
						rel="noopener noreferrer"
						href={`https://www.google.com/maps/search/?api=1&query=${coordinates && coordinates.Rc},${coordinates && coordinates.Ac}`}>
						<p>{address}</p>
					</a>
				</div>
				<div className="phone-container">
					<img src={Phone} alt="Phone"></img>
					{ 
						this.state.selectedBusiness && this.state.selectedBusiness.phoneNumber ?
							<a href={`tel:${this.state.selectedBusiness.phoneNumber}`}>
								<p>{this.state.selectedBusiness.phoneNumber}</p>
							</a> : null
					}
				</div>
			</div>
			<hr></hr>
			<div className="business-specs-container section">
				<div className="info-box">
					<h4>Category</h4>
					{
					category &&
					<BusinessIcon 
						icon={category}
						size="40px"
					/>}
				</div>
				<div className="info-box last">
					<h4>My Favorite</h4>
					<div>
						{
							this.state.userFavorite ? 
								<img className="favorite-icons" onClick={() => this.handle_add_to_favorites()} src={Heart} alt="Favorite button"></img> 
								:	<img className="favorite-icons" onClick={() => this.handle_add_to_favorites()} src={EmptyHeart} alt="unfavorite button"></img>
						}
					</div>
				</div>
			</div>

			<div className="about-the-business business-info section">
				<h1>About {name}</h1>
				<p>{description}</p>
			</div>

			<div className="section business-info">
				<h1>Featured Photos</h1>
				<div className="feature-photo-container">
					{featurePhoto1 && 
						<img
							className="feature-photo"
							src={featurePhoto1}
							alt="Hello World!"
						></img>
					}
					{featurePhoto2 && <img className="feature-photo" alt="Feature 2" src={featurePhoto2}></img>}
					{featurePhoto3 && <img className="feature-photo" alt="Feature 3" src={featurePhoto3}></img>}

				</div>
			</div>

			<div className="social-media business-info section">
				<h1> Social Media </h1>
				<div className="social-container">
					{ 
					socialMedia && socialMedia.instagram ? 
							<div className="link-container">
								<img className="social-media-icons" alt="instagram" src={Instagram}></img>
								<a target="_blank" rel="noopener noreferrer" href={socialMedia.instagram}>{socialMedia.instagram}</a>
							</div>
						: null
				}
					{ 
					socialMedia && socialMedia.twitter ? 
						<div className="link-container">
							<img className="social-media-icons" alt="twitter" src={Twitter}></img>
							<a target="_blank" rel="noopener noreferrer" href={socialMedia.twitter}>
							{socialMedia.twitter}
						</a> 
						
					</div>
						: null
				}
					{ 
					socialMedia && socialMedia.facebook ? 
						<div className="link-container">
							<img className="social-media-icons" alt="facebook" src={FaceBook}></img>
							<a target="_blank" rel="noopener noreferrer" href={socialMedia.facebook}>
							{socialMedia.facebook}
						</a> 
						
					</div>
						: null
				}
					{ 
					socialMedia && socialMedia.website ? 
						<div className="link-container">
							<img className="social-media-icons" alt="web" src={Web}></img>
							<a target="_blank" rel="noopener noreferrer" href={socialMedia.website}>
							{socialMedia.website}
						</a> 
						
					</div>
						: null
				}
					{ 
					socialMedia && socialMedia.email ? 
						<div className="link-container">
							<img className="social-media-icons" alt="email" src={Email}></img>
							<a target="_blank" rel="noopener noreferrer" href={socialMedia.email}>
							{socialMedia.email}
						</a> 
						
					</div>
						: null
				}
				{ 
					socialMedia && socialMedia.youtube ? 
						<div className="link-container">
							<img className="social-media-icons" alt="youtube" src={YouTube}></img>
							<a target="_blank" rel="noopener noreferrer" href={socialMedia.youtube}>
							{socialMedia.youtube}
						</a> 
						
					</div>
						: null
				}
				</div>
			</div>
			<div className="map review-section section">
				<h1>Location</h1>
				{ 
					coordinates && <div style={{ height: '400px', width: 'auto', overflow: 'hidden', margin: '5px 0 10px 0' }}>
						<GoogleMapReact
							bootstrapURLKeys={{ key: process.env.REACT_APP_APIKEY }}
							defaultCenter={location}
							defaultZoom={15}
							yesIWantToUseGoogleMapApiInternals
							>
							<LocationPin
								lat={coordinates.Rc}
								lng={coordinates.Ac}
								icon={category}
							/>
						</GoogleMapReact>
					</div> 
				}

			</div>

			<div className="review-container review-section section">
				<h1>REVIEWS</h1>
				{
					this.state.selectedBusiness?.comments ? this.state.selectedBusiness.comments.map((comment, index) => {
						return (
							<div className="review" key={index}>
								<img src={comment.user.photoURL} alt="user profile"></img>
								<div className="review-holder">
									<header><strong>{comment.user.displayName}</strong> left a <span className={comment.reviewType}>{comment.reviewType}</span> review.</header>
									<p>{comment.comment}</p>
								</div>
							</div>
						)
					}) :
					<span style={{ marginTop: '60px' }}>No reviews yet</span>
				}
			</div>

			<div className="leave-review-container review-section section">
				<h1>LEAVE A REVIEW</h1>
				<div className="review-buttons-container">
					<button id="positive-button" type="button" onClick={() => this.addReview('positive')}>Positive</button>
					<button id="neutral-button" type="button" onClick={() => this.addReview('neutral')}>Neutral</button>
					<button id="negative-button" type="button" onClick={() => this.addReview('negative')}>Negative</button>
				</div>
					<form onSubmit={(e) => this.handle_submit_comment(e)}>
						<textarea
							className={`${this.state.reviewType}`}
							placeholder="Select which type of review you want to leave for this business."
							type="text"
							name="comment"
							value={this.state.comment}
							onChange={(e) => this.handleChange(e)}
							autoComplete="off"
							height="250px"
							disabled={this.state.disableReview}
						/>
						<button disabled={this.state.disableReview} type="submit">Add Review</button>
					</form>
			</div>

			<BottomBar />
		</div>
	)}
}

export default Business


const LocationPin = ({ icon, lat, lng }) => (
	<div className="pin">
		<a target="_blank" 
					rel="noopener noreferrer"
					href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}>
	  {<BusinessIcon 
		  icon={icon}
		  size="40px"
	  />}</a>
	</div>
  )

