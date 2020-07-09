import React from 'react'
import './home.css'
import TopBar from '../../components/navigation/topNavigation/topBar'
import { firestore, auth } from '../../firebase'
import { collectIdsandDocs } from '../../utils/utilities'
import TileDisplay from '../../components/TileDisplay'
import firebase from 'firebase/app';
import { GeoFirestore } from 'geofirestore';
import Button from '../../components/button/button'

class Home extends React.Component {
	state = { 
		user: null,
		businesses: [],
		nearestBusinesses: [],
		nearYou: false,
	}

	unsubscribeFromAuth = null; 
	unsubscribeFromBusinesses = null;

	componentDidMount = async () => { 
		this.unsubscribeFromAuth = auth.onAuthStateChanged( user => {
			this.setState({ user })
			if (user === null) {
			this.props.history.push('/login')

			}
		}); 
		this.unsubscribeFromBusinesses = firestore.collection('businesses').onSnapshot( snapshot => {
			const businesses = snapshot.docs.map(collectIdsandDocs);
			this.setState({ businesses })
		  }); 
		
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

	componentWillUnmount = () => {
		this.unsubscribeFromAuth();
		this.unsubscribeFromBusinesses();
	}

	render(){
		return (
			<div id="site">
				<div><TopBar /></div>
				<div>
					{
						this.state.nearYou ? <div><Button text="All Businesses" clickEvent={this.showAllBusiness}/></div> :
						<div><Button text="Near You" clickEvent={this.getLocation}/></div>
					}
					
				</div>
				<div>
					<div className="businessTL">
						{
							this.state.nearYou ? this.state.nearestBusinesses.map((business) => {            
								return (
									<TileDisplay
										items={business}
										key={business.id}
								/>
								)
							}):
							this.state.businesses.map((business) => {            
								return (
									<TileDisplay
										items={business}
										key={business.id}
								/>
								)
							})
						}
					</div>
				</div>
			</div>
		)
	}
}

export default Home
