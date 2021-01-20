import React from 'react'
import { firestore, auth, createUserProfileDocument } from '../../firebase'
import { collectIdsandDocs } from '../../utils/utilities'
import BusinessIcon from '../../components/business-icons/BusinessIcon'
import '../../App.scss'
import GoogleMapReact from 'google-map-react';

const LocationPin = ({ text, businessName, icon }) => {
	console.log(businessName);
	return (
	<div className="pin">
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

	componentWillUnmount = () => {
		this.unsubscribeFromAuth();
		this.unsubscribeFromBusinesses();

	}

	handleChange = (event) => {
 		this.setState({[event.target.name]: event.target.value})  
	}

  render(){
		const {businesses, user} = this.state
 		console.log(businesses, user);
 
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
							console.log(business);
							
							return (
								<LocationPin
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
		</div>
	)
  }
}

export default BusinessMap
