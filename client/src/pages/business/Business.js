import React from 'react'
import { FieldValue, firestore, auth, createUserProfileDocument } from '../../firebase'
import './business.scss'
import { collectIdsandDocs } from '../../utils/utilities'
import BusinessIcon from '../../components/business-icons/BusinessIcon'
import GoogleMapReact from 'google-map-react';
import UpArrow from '../../styles/assets/up-arrow.png';
import DownArrow from '../../styles/assets/down-arrow.png';
import EmptyHeart from '../../styles/assets/clearHeart.png';
import Heart from '../../styles/assets/heart.png';
import FaceBook from '../../styles/assets/social-media/facebookLogo.png';
import Instagram from '../../styles/assets/social-media/instagram.jpg';
import Web from '../../styles/assets/social-media/website.png';
import Twitter from '../../styles/assets/social-media/twitter.png';
import YouTube from '../../styles/assets/social-media/youtube.png';
import Email from '../../styles/assets/social-media/email.png';
import ModalImage from "react-modal-image";
import { formatPhoneNumber } from 'react-phone-number-input'
// formatPhoneNumber('+12133734253') === '(213) 373-4253'


class Business extends React.Component {
	state = { 
		selectedBusiness: {},
		user: [],
		userDownVoted: null,
		userUpVoted: null,
		userFavorite: false,
		comment: '',
	}

	unsubscribeFromAuth = null; 
	unsubscribeFromBusiness = null;
	businessID = this.props.match.params.id;

	componentDidMount = async () => {
		this.unsubscribeFromAuth = auth.onAuthStateChanged( async userAuth => {
			if (userAuth) {
				const userRef = await createUserProfileDocument(userAuth)
				userRef.onSnapshot(snapshot => {
					this.setState({ 
						user: {uid: snapshot.id, ...snapshot.data()} 
					}, this.handle_user_favorites)
				})
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
		console.log(selectedBusiness);
		
		selectedBusiness.upVoteCount = selectedBusiness.upvotes.length || 0;
		selectedBusiness.downVoteCount = selectedBusiness.downvotes.length || 0;
		selectedBusiness.userDownVoted = selectedBusiness.downvotes.includes(this.uid);
		selectedBusiness.userUpVoted = selectedBusiness.upvotes.includes(this.uid);
		
		this.setState({ selectedBusiness, 
			userDownVoted: selectedBusiness.userDownVoted,
			userUpVoted: selectedBusiness.userUpVoted 
		})
	}

	handle_submit_comment = (event) => {
		event.preventDefault();
		const {comment} = this.state;
		const { uid, displayName, email, photoURL } = this.state.user || {}
		const comments = {
		  comment ,
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

	vote = (vote) => {
		if (vote === "downvote") {
			if(this.state.userDownVoted) return;
			this.businessRef.update({
				downvotes: FieldValue.arrayUnion(this.uid),
				upvotes: FieldValue.arrayRemove(this.uid)
			})
			.then(()=> {
				console.log('Success');
				this.setState({ userDownVoted: true, userUpVoted: false })
			})
			.catch((error)=> {
				console.error(error);
			});
		}

		if (vote === "upvote") {
			if(this.state.userUpVoted) return;
			this.businessRef.update({
				upvotes: FieldValue.arrayUnion(this.uid),
				downvotes: FieldValue.arrayRemove(this.uid)
			})
			.then(()=> {
				console.log('Success');
				this.setState({ userUpVoted: true, userDownVoted: false})
			})
			.catch((error)=> {
				console.error(error);
			});
		}
	}

	handle_add_to_favorites = () => {
		this.setState(prevState => ({
			userFavorite: !prevState.userFavorite
		  }),() => {
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
		})

	}

	componentWillUnmount = () => {
		this.unsubscribeFromAuth();
		this.unsubscribeFromBusiness();
	}

	handleChange = (event) => {
 		this.setState({[event.target.name]: event.target.value})  
	}

  render(){
		const { 	
			businessCategory,
			businessAddress,
			businessNumber,
			businessDescription,
			socialMedia,
			businessName,
			coverPhoto,
			featurePhoto1,
			featurePhoto2,
			featurePhoto3,
			coordinates,
		} = this.state.selectedBusiness;
		
		const location = {
			address: '4821 sw 23rd st West Park, FL 33023',
			lat: coordinates && coordinates.oa,
			lng: coordinates && coordinates.ha,
		}
		console.log(this.state);
		
	return (
		<div id="business">
			<div className="info-card">
				<img className='business-photo' src={coverPhoto} alt={businessName}></img>
				<div className="main-info">
					<h1>{businessName}</h1>
					<a target="_blank" 
						rel="noopener noreferrer"
						href={`https://www.google.com/maps/search/?api=1&query=${coordinates && coordinates.oa},${coordinates && coordinates.ha}`}><p>{businessAddress}</p></a>
					<a href={`tel:${businessNumber}`}><p>{businessNumber}</p></a>
				</div>
			</div>
			<hr></hr>
			<div className="info-container">
				<div className="info-box">
					<h4>Category</h4>
					{
					businessCategory &&
					<BusinessIcon 
						icon={businessCategory}
						size="40px"
					/>}
				</div>
				<div className="info-box">
					<h4>Upvotes</h4>
					<div className="green vote-counter">{this.state.selectedBusiness.upVoteCount}</div>
					<div onClick={() => this.vote('upvote')}><img src={UpArrow} alt="up vote arrow"></img></div>
				</div>
				<div className="info-box">
					<h4>Downvotes</h4>
					<div className="red vote-counter">{this.state.selectedBusiness.downVoteCount}</div>
					<div onClick={() => this.vote('downvote')}><img src={DownArrow} alt="down vote arrow"></img></div>
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

			<div className="about-the-business">
				<h1>About this Business</h1>
				<p>{businessDescription}</p>
			</div>

			<h1>Featured Photos</h1>
			<div className="feature-photo-container">
				{featurePhoto1 && 
				<ModalImage
				className="feature-photo"
				small={featurePhoto1}
				large={featurePhoto1}
				alt="Hello World!"
			  />
				}
				{featurePhoto2 && <img className="feature-photo" alt="Feature 2" src={featurePhoto2}></img>}
				{featurePhoto3 && <img className="feature-photo" alt="Feature 3" src={featurePhoto3}></img>}

			</div>

			<div className="social-media">
				<h1> Follow Us On </h1>
				<div className="social-container">
					{ 
					socialMedia && socialMedia.instagram ? 
						<a target="_blank" rel="noopener noreferrer" href={socialMedia.instagram}><img className="social-media-icons" alt="instagram" src={Instagram}></img></a> : null
				}
					{ 
					socialMedia && socialMedia.twitter ? 
						<a target="_blank" rel="noopener noreferrer" href={socialMedia.twitter}><img className="social-media-icons" alt="twitter" src={Twitter}></img></a> : null
				}
					{ 
					socialMedia && socialMedia.facebook ? 
						<a target="_blank" rel="noopener noreferrer" href={socialMedia.facebook}><img className="social-media-icons" alt="facebook" src={FaceBook}></img></a> : null
				}
					{ 
					socialMedia && socialMedia.website ? 
						<a target="_blank" rel="noopener noreferrer" href={socialMedia.website}><img className="social-media-icons" alt="web" src={Web}></img></a> : null
				}
					{ 
					socialMedia && socialMedia.email ? 
						<a target="_blank" rel="noopener noreferrer" href={socialMedia.email}><img className="social-media-icons" alt="email" src={Email}></img></a> : null
				}
				{ 
					socialMedia && socialMedia.youtube ? 
						<a target="_blank" rel="noopener noreferrer" href={socialMedia.youtube}><img className="social-media-icons" alt="youtube" src={YouTube}></img></a> : null
				}
				</div>
			</div>
			{ 
				coordinates && <div style={{ height: '400px', width: 'auto', borderRadius: '50px', overflow: 'hidden' }}>
					<GoogleMapReact
						bootstrapURLKeys={{ key: process.env.REACT_APP_APIKEY }}
						defaultCenter={location}
						defaultZoom={15}
						yesIWantToUseGoogleMapApiInternals
						>
						<LocationPin
							lat={coordinates.oa}
							lng={coordinates.ha}
							icon={businessCategory}
						/>
					</GoogleMapReact>
				</div> 
			}

			<div className="comment-section">
				<h1>LEAVE A REVIEW</h1>
					<form onSubmit={(e) => this.handle_submit_comment(e)}>
						<textarea
							placeholder="Comments"
							type="text"
							name="comment"
							value={this.state.comment}
							onChange={(e) => this.handleChange(e)}
							autoComplete="off"
						/>
						<button type="submit">Add Review</button>
					</form>
			</div>
			<div className="comments">
				<h1>REVIEWS</h1>
				{
					this.state.selectedBusiness.comments && this.state.selectedBusiness.comments.map((comment, index) => {
						return (
							<div className="comment" key={index}>
								<img src={comment.user.photoURL} alt="user profile"></img>
								<p>{comment.comment}</p>
							</div>
						)
					})
				}
			</div>
		</div>
	)
  }
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

