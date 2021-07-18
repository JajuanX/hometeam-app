import React from 'react'
import './search.scss'
import TopBar from '../../components/navigation/topNavigation/topBar'
import { firestore, auth, createUserProfileDocument } from '../../firebase'
import { collectIdsandDocs } from '../../utils/utilities'
import TileDisplay from '../../components/businessTile/TileDisplay'
import Masonry from 'react-masonry-css';
import BottomBar from '../../components/navigation/bottomNavigation/bottomBar'

class Search extends React.Component {
	state = { 
		user: null,
		businesses: [],
		userSelectedCategory: false,
		isLoading: false,
		noBusinesses: false,
		searchString: '',
		category: ''
	}

	businessTypes = [ 'Restaurants', 'Beauty', 'Church', 'Education', 'Event Planning', 
	'Financial', 'Fitness', 'Graphic Design', 'Web Services', 'Videography', 'Photography',
	'Clothing', 'Printing Services', 'Car Wash', 'Real Estate', 'Coaching', 'Tattoo Artist',
	'Art', 'Barbershop', 'Mobile Repair' ].sort();
	
	_isMounted = false;
	unsubscribeFromAuth = null; 
	unsubscribeFromBusinesses = null;
	pageSize = 8;
	field = 'businessName'
	filteredBusinesses = []

	componentDidMount = () => { 
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
				this.props.history.push('/login');
			}			
		}); 
		
	}


	handleChange = (event) => {
		event.preventDefault();
		this.setState({[event.target.name]: event.target.value}, () => this.searchByTyping());
	}

	searchByTyping = () => {
		this.filteredBusinesses = this.filteredBusinesses.filter( business => {
			if (business.businessName.includes(this.state.searchString)){
				return business;
			} 
			return this.filteredBusinesses;
		})
	}

	searchForCategory = async (category) =>  {
		this.setState({ isLoading: true})

		this.unsubscribeFromBusinesses = await firestore.collection('businesses')
			.where('businessCategory', '==', `${category}`)
			.get();
		let results = this.unsubscribeFromBusinesses.docs.map(collectIdsandDocs);
		if(results) this.filteredBusinesses = results;
		this.setState({businesses: results, isLoading: false, userSelectedCategory: true, category})
	}

	get uid() {
		return auth.currentUser.uid
	}

	get userRef() {
		return firestore.doc(`users/${this.uid}`);
	}

	componentWillUnmount = () => {
		this.unsubscribeFromAuth();
		this._isMounted = false;
	}

	render(){
		let filteredBusinesses = this.state.businesses.filter( business => {
			return business.businessName.toLowerCase().includes(this.state.searchString.toLowerCase()
			)}
		);
		const breakpointColumnsObj = {
			default: 6,
			1100: 6,
			700: 2,
			500: 2
		};

		return (
			<div id="search-page">
				<div id="top-of-page">
					<TopBar
						user={this.state.user}
					/>
				</div>

				<h1>Select a Category</h1>
				<div className="category-container">
					{
						this.businessTypes.map((category, index) => {
							return (
								<div key={index}>
									<div className="category-names">
										<button 
											className="category"  
											type="button" 
											value={category} 
											onClick={(e) => this.searchForCategory(e.target.value)}
											>{category}
										</button>
									</div>
								</div>
							)
						})
					}
				</div>

				<input
					name="searchString"
					type="text"
					placeholder="Select a category then search by name"
					value={this.state.searchString}
					onChange={this.handleChange}
					autoComplete="off"
					disabled={this.state.businesses.length === 0}
					/>
				<div className="search-container">
					{ this.state.userSelectedCategory ? 
					<Masonry
						breakpointCols={breakpointColumnsObj}
						className="my-masonry-grid"
						columnClassName="my-masonry-grid_column"
					>
						{
							filteredBusinesses.map((business) => {
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
					:
					<div className="user-guide">
						Try selecting from a category above.
					</div>
					}
				{ this.state.userSelectedCategory && this.state.businesses.length === 0 ?
					<div className="user-guide">
						No results found for the category {this.state.category}
					</div> : null
				}
				</div>
				<BottomBar />
			</div>
		)}
}

export default Search
