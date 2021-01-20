import React from 'react'
import './home.scss'
import TopBar from '../../components/navigation/topNavigation/topBar'
import { firestore, auth, createUserProfileDocument } from '../../firebase'
import { collectIdsandDocs } from '../../utils/utilities'
import TileDisplay from '../../components/businessTile/TileDisplay'
import firebase from 'firebase/app';
import { GeoFirestore } from 'geofirestore';
import Button from '../../components/button/button';
import Masonry from 'react-masonry-css';
import { Waypoint } from 'react-waypoint';
import HomeTeamLogo from '../../styles/assets/HomeTeamWording.png';
import SplashPage from '../../components/splash-page/splash-page';

class Home extends React.Component {
	state = { 
		user: null,
		businesses: [],
		nearestBusinesses: [],
		nearYou: false,
		endPrevPagination: false,
		currentPage: 1,
		isLoading: false,
		noBusinesses: false,
		searching: false,
	}
 
	unsubscribeFromAuth = null; 
	unsubscribeFromBusinesses = null;
	pageSize = 8;
	field = 'businessName'
	businessTypes = [ 'Restaurants', 'Beauty', 'Church', 'Education', 'Event Planning', 
	'Financial', 'Fitness', 'Graphic Design', 'Web Services', 'Videography', 'Photography',
	'Clothing', 'Printing Services', 'Car Wash', 'Real Estate', 'Coaching', 'Tattoo Artist',
	'Art', 'Barbershop', 'Mobile Repair' ].sort();

	componentDidMount = async () => { 
		this.setState({ isLoading: true })
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

	nextPage = () => {
		let businesses = this.state.businesses;
		if(businesses.length === 0) return;

		this.setState({isLoading: true});
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
					currentPage: pageNumber, 
					isLoading: false });
				}, (error) => {
					error.log(error);
				})
	}

	showAllBusiness = () => {
		this.setState({ nearYou: false })
	}

	getLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(this.getClosestBusinesses);
		} else { 
			
		}
	}
	

	getClosestBusinesses = async (position) => {
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
		this.setState({ nearYou: true })
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

	handleLike = event => {
		event.preventDefault()
		this.userRef.arrayUnion(`${this.uid}`);
	}

	componentWillUnmount = () => {
		this.unsubscribeFromAuth();
		this.unsubscribeFromBusinesses();
	}

	render(){
		const breakpointColumnsObj = {
			default: 6,
			1100: 6,
			700: 2,
			500: 2
		  };

		return (
			<div id="home-page">
				<div id="top-of-page">
					<TopBar
						user={this.state.user}
						searching={this.searching}
					/>
				</div>
				<div className="top-buttons">
					{
						this.state.nearYou ? <div><Button text="All Businesses" clickEvent={this.showAllBusiness}/></div> :
						<div><Button text="Near You" clickEvent={this.getLocation}/></div>
					}
					<div><Button text="Business Map" clickEvent={this.goToMap}/></div>
				</div>

				<div className="biz-container">
					<Masonry
						breakpointCols={breakpointColumnsObj}
						className="my-masonry-grid"
						columnClassName="my-masonry-grid_column"
					>
						{
							this.state.nearYou ? this.state.nearestBusinesses.map((business) => {
								return (
											<TileDisplay
												key={business.id}
												business={business}
												id={business.id}
											/>
								)
							}):
							this.state.businesses.map((business) => {
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
				<div className="waypoint">
					{	this.state.isLoading ?	
						<img className="loading-logo" src={HomeTeamLogo} alt="Home Team Logo"></img>
						: null
					}
					{	this.state.noBusinesses ? 
						<>
						<a href="#home-page">
							<div>
								<div>All Businesses Loaded</div>
								<div className="up-chevrons">
									<div className="chevron-arrow-right"></div>
									<div className="chevron-arrow-right"></div>
									<div className="chevron-arrow-right"></div>
								</div>
								<div className="back-to-top">Back to Top</div>
							</div>
						</a>
						</>
						: null
					}
					<Waypoint
						onEnter={this.nextPage}
					/>
				</div>
				{ this.state.isLoading && <SplashPage /> }
			</div>
		)
	}
}

export default Home
