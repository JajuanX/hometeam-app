import React from 'react'
import { firestore, auth, createUserProfileDocument } from '../../firebase'
import { collectIdsandDocs } from '../../utils/utilities'
import BusinessIcon from '../../components/business-icons/BusinessIcon'
import '../../App.scss'
import GoogleMapReact from 'google-map-react';
import BusinessDisplay from '../../components/business-display/BusinessDisplay'

const LocationPin = ({ business, icon, showBusiness}) => {
	let pinnedBusiness = business;
	return (
	<div className="pin" onClick={() => showBusiness(pinnedBusiness)}>
	  <BusinessIcon 
		  icon={icon}
		  size="40px"
	  />
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

	unsubscribeFromAuth = null; 
	unsubscribeFromBusinesses = null;

	componentDidMount = async () => {
		this.unsubscribeFromAuth = auth.onAuthStateChanged( async userAuth => {
			if (userAuth) {
				const userRef = await createUserProfileDocument(userAuth)
				userRef.onSnapshot(snapshot => {
					this.setState({ user: {uid: snapshot.id, ...snapshot.data()} })
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

	return (
		<div id="businessMap">
			<div style={{ height: '400px', width: '100%', borderRadius: '50px', overflow: 'hidden' }}>
				<GoogleMapReact
					bootstrapURLKeys={{ key: process.env.REACT_APP_APIKEY }}
					defaultCenter={location}
					defaultZoom={11}
					yesIWantToUseGoogleMapApiInternals
					hoverDistance={40}
					>
					{
						businesses && businesses.map( business => {
							return (
								<LocationPin
									showBusiness={this.showBusiness}
									business={business}
									lat={business.coordinates.oa}
									lng={business.coordinates.ha}
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
					null
			}
		</div>
	)
  }
}

export default BusinessMap
