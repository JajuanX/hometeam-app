import React from 'react'
import { firestore, auth, createUserProfileDocument } from '../../firebase'
import { collectIdsandDocs } from '../../utils/utilities'
import BusinessIcon from '../../components/business-icons/BusinessIcon'
import './businessMap.scss'
import GoogleMapReact from 'google-map-react';
import BusinessDisplay from '../../components/business-display/BusinessDisplay'
import TopBar from '../../components/navigation/topNavigation/topBar'
import BottomBar from '../../components/navigation/bottomNavigation/bottomBar'

const LocationPin = ({ business, icon, showBusiness}) => {
	let pinnedBusiness = business;
	return (
	<div className="pin" onClick={() => showBusiness(pinnedBusiness)}>
		<div>
			<BusinessIcon 
				icon={icon}
				size="40px"
			/>
		</div>
	 	<h6 style={{fontSize: '12px', width: '60px'}}>{business.businessName}</h6>
	</div>
  )}

  const handleApiLoaded = (map, maps) => {
	// use map and maps objects
	console.log(map, maps);
	
  };

class BusinessMap extends React.Component {
	state = { 
		businessMap:[],
		user: [],
		business: {},
		showBusiness: false,
	}
	_isMounted = false;
	unsubscribeFromAuth = null; 
	unsubscribeFromBusinesses = null;

	componentDidMount = async () => {
		this._isMounted = true;

		this.unsubscribeFromAuth = auth.onAuthStateChanged( async userAuth => {
			if (userAuth) {
				const userRef = await createUserProfileDocument(userAuth)
				userRef.onSnapshot(snapshot => {
					if (this._isMounted) {
						this.setState({ user: {uid: snapshot.id, ...snapshot.data()} })
					}
				})
			} else {
				this.setState({user: userAuth})
			}			
		});

		this.unsubscribeFromBusinesses = firestore.collection('businesses').onSnapshot( snapshot => {
			const businesses = snapshot.docs.map(collectIdsandDocs);
			this.setState({ businesses })
		}); 
		
		
	}

	showBusiness = (business) => {
		console.log("clicked", business);
		this.setState({business, showBusiness: true,})
	}

	componentWillUnmount = () => {
		this.unsubscribeFromAuth();
		this.unsubscribeFromBusinesses();
		this._isMounted = false;

	}

	handleChange = (event) => {
 		this.setState({[event.target.name]: event.target.value})  
	}

  render(){
		const {businesses, user} = this.state 
		const location = {
			address: '4821 sw 23rd st West Park, FL 33023',
			lat: 25.990009,
			lng: -80.1922577,
		}
		console.log(user);
		

	return (
		<div id="businessMap">
			<TopBar user={this.state.user} />
			<div style={{ height: '350px', width: '100%', overflow: 'hidden' }}>
				<GoogleMapReact
					bootstrapURLKeys={{ key: process.env.REACT_APP_APIKEY }}
					defaultCenter={location}
					defaultZoom={13}
					yesIWantToUseGoogleMapApiInternals
					hoverDistance={40}
				>
					{
						businesses && businesses.map( business => {
							return (
								<LocationPin
									key={business.id}
									showBusiness={this.showBusiness}
									business={business}
									lat={business.coordinates.Rc}
									lng={business.coordinates.Ac}
									icon={business.businessCategory}
									businessName={business.businessName}
									onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
								/>
							)
						})
					}
				</GoogleMapReact>
			</div> 
			{	this.state.showBusiness ?
					<BusinessDisplay
						key={this.state.business.id}
						business={this.state.business}
						id={this.state.business.id}
						user={this.state.user}
						handle_add_to_favorites={this.handle_add_to_favorites}
					/>
					:
					<div className="help-block">
						<p>Select a business above to view more details.</p>
					</div>
			}
			<BottomBar />
		</div>
	)}
}

export default BusinessMap
