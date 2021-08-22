import React from 'react';
import './home.scss';
import { Link } from 'react-router-dom';
import TopBar from '../../components/navigation/topNavigation/topBar';
import { firestore, auth, createUserProfileDocument } from '../../firebase';
import { collectIdsandDocs } from '../../utils/utilities';
import TileDisplay from '../../components/businessTile/TileDisplay';
import firebase from 'firebase/app';
import { GeoFirestore } from 'geofirestore';
import Masonry from 'react-masonry-css';
import { Waypoint } from 'react-waypoint';
import HomeTeamLogoNoWords from '../../styles/assets/HomeTeamNoWords.png';
import BottomBar from '../../components/navigation/bottomNavigation/bottomBar'

class Home extends React.Component {
	state = { 
		user: null,
		businesses: [],
		nearestBusinesses: [],
		nearYou: false,
		endPrevPagination: false,
		currentPage: 1,
		isLoading: true,
		noBusinesses: false,
		searching: false,
		loading: false,
		userFavoriteBusinesses: [],
	}

	_isMounted = false;
	unsubscribeFromAuth = null; 
	unsubscribeFromBusinesses = null;
	unsubsribeFromUserFavorites = null;
	color = '#ef5f24';
	pageSize = 8;
	field = 'businessName'
	businessTypes = [ 'Restaurants', 'Beauty', 'Church', 'Education', 'Event Planning', 
	'Financial', 'Fitness', 'Graphic Design', 'Web Services', 'Videography', 'Photography',
	'Clothing', 'Printing Services', 'Car Wash', 'Real Estate', 'Coaching', 'Tattoo Artist',
	'Art', 'Barbershop', 'Mobile Repair' ].sort();

	componentDidMount = () => { 
		this._isMounted = true;
		
		this.unsubscribeFromAuth = auth.onAuthStateChanged( async userAuth => {
			if (userAuth) {
				const userRef = await createUserProfileDocument(userAuth)
				userRef.onSnapshot(snapshot => {
					if (this._isMounted) {
						this.setState({ user: {uid: snapshot.id, ...snapshot.data()} }, () => this.get_user_favorites())
					}
				})
				
			} else {
				this.props.history.push('/login');
			}			
		}); 
		this.unsubscribeFromBusinesses = firestore
			.collection('businesses')
			.orderBy(this.field)
			.limit(this.pageSize)
			.onSnapshot( snapshot => {
			const businesses = snapshot.docs.map(collectIdsandDocs);
			this.setState({ businesses, isLoading: false })
			}, (error) => {
				error.log(error);
		}); 
		
	}

	get_user_favorites = () => {
		const userFavorites = this.state.user.favorites.map( favorite => {
			return firestore.doc(`businesses/${favorite}`).get();
		})

		Promise.all(userFavorites)
			.then(docs => {
				const businesses = docs.map(doc =>{
					return {
						id: doc.id,
						...doc.data()
						}
				});
				if (this._isMounted) {
					this.setState({userFavoriteBusinesses: businesses})
				}
				
			})
			.catch((error) => {
				console.log(error);
			})
		
	}

	nextPage = () => {		
		let businesses = this.state.businesses;
		if(businesses.length === 0) return;
		console.log('loading');
		const last = this.state.businesses[this.state.businesses.length - 1];
		this.unsubscribeFromBusinesses = firestore.collection('businesses')
			.orderBy(this.field)
			.startAfter(last.businessName)
			.limit(this.pageSize)
			.onSnapshot( snapshot => {
				const nextgroup = snapshot.docs.map(collectIdsandDocs);
				if(nextgroup.length === 0){
					this.setState({ noBusinesses: true})
				} else {
					this.setState({ noBusinesses: false})
				};
				businesses = [...businesses, ...nextgroup];
				const pageNumber = this.state.currentPage + 1;
				if(businesses.length === 0) return;
				this.setState({ 
					businesses, 
					currentPage: pageNumber});
				}, (error) => {
					error.log(error);
				})
	}

	showAllBusiness = () => {
		this.setState({ nearYou: false })
	}

	getLocation = () => {
		if (navigator.geolocation) {
			this.setState({ loading: true })
			console.log('running');
			
			navigator.geolocation.getCurrentPosition(this.getClosestBusinesses);
		} else { 
			
		}
	}
	

	getClosestBusinesses = async (position) => {
		console.log('working');
		
		const geofirestore = new GeoFirestore(firestore);
		const geocollection = geofirestore.collection('businesses');
		let lat = await position.coords.latitude;
		let lng = await position.coords.longitude;
		// Create a GeoQuery based on a location
		const query = geocollection.near({ center: new firebase.firestore.GeoPoint(lat, lng), radius: 20 });
		
		// Get query (as Promise)
		query.get().then((value) => {
		// All GeoDocument returned by GeoQuery, like the GeoDocument added above
		});
		query.onSnapshot((snapshot) => {
			const nearestBusinesses = snapshot.docs.map(collectIdsandDocs)
			this.setState({ nearestBusinesses })
		})
	}

	goToMap = () => {
		this.props.history.push('/map');
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

	handleLike = event => {
		event.preventDefault()
		this.userRef.arrayUnion(`${this.uid}`);
	}

	toggleNearby = () => {	
		this.setState(prevState => ({
			nearYou: !prevState.nearYou
		  }), () => this.nearby());
	}

	nearby = () => {
		console.log(this.state.nearYou);
		if (!this.state.nearYou) return
		this.getLocation();
	}

	componentWillUnmount = () => {
		this.unsubscribeFromAuth();
		this.unsubscribeFromBusinesses();
		this._isMounted = false;
	}

	render(){
		const breakpointColumnsObj = {
			default: 6,
			1100: 6,
			700: 2,
			500: 2
		};

		return (
			<div id="home-page" data-testid='home-page'>
				<div id="top-of-page">
					<TopBar 
						user={this.state.user}
					/>
				</div>

				<div className="user-favorites">
					<div className="hometeam-favorite">
						<img src={HomeTeamLogoNoWords} alt="Hometeam"></img>
						<h2>Favorites</h2>
					</div>
					{
						this.state.userFavoriteBusinesses && this.state.userFavoriteBusinesses ? this.state.userFavoriteBusinesses.map((favoriteBusiness, index) => {
							return (
								<Link to={`/business/${favoriteBusiness.id}`} className="favorite-business" key={favoriteBusiness.id}>
									<img src={favoriteBusiness.coverPhoto} alt={favoriteBusiness.businessName}></img>
									<h2>{favoriteBusiness.businessName}</h2>	
								</Link>
							)
						}): null
					}
				</div>
				<div className="top-buttons">
					<div className="custom-checkbox">
						<input id="status" 
								type="checkbox" 
								name="status"
								value={this.state.nearYou}
								onChange={() => this.toggleNearby()}
								></input>
						<label htmlFor="status">
							<div className="status-switch"
								data-unchecked={this.state.nearYou ? '' : 'Nearby Off'}
								data-checked={this.state.nearYou ? 'Nearby On' : ''}>
							</div>
						</label>
					</div>	
				</div>
				{/* <ScaleLoader color={this.color} loading={this.state.loading} css={override} size={150} /> */}

				{	this.state.businesses &&
					<div className="biz-container">
						<Masonry
							breakpointCols={breakpointColumnsObj}
							className="my-masonry-grid"
							columnClassName="my-masonry-grid_column"
						>
							{
								this.state.businesses?.map((business) => {
									return (
											<TileDisplay
												key={business.id}
												business={business}
												id={business.id}
											/>
									)
								})
							}
						</Masonry>
					</div>
				}

				<div className="waypoint">
					<Waypoint
						onEnter={this.nextPage}
					/>
				</div>

				<BottomBar />
			</div>
		)
	}
}

export default Home
