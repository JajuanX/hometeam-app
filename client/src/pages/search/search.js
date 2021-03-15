import React from 'react'
import './search.scss'
import TopBar from '../../components/navigation/topNavigation/topBar'
import { firestore, auth, createUserProfileDocument } from '../../firebase'
import { collectIdsandDocs } from '../../utils/utilities'
import BusinessDisplay from '../../components/business-display/BusinessDisplay'

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
 
	unsubscribeFromAuth = null; 
	unsubscribeFromBusinesses = null;
	pageSize = 8;
	field = 'businessName'
	filteredBusinesses = []

	componentDidMount = async () => { 
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
	}

	render(){
		let filteredBusinesses = this.state.businesses.filter( business => {
			if (business.businessName.toLowerCase().includes(this.state.searchString.toLowerCase())){
				return business;
			} 
		})

		return (
			<div id="search-page">
				<div id="top-of-page">
					<TopBar
						user={this.state.user}
					/>
				</div>

				<h1>Category</h1>
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
					value={this.state.searchString}
					onChange={this.handleChange}
					autoComplete="off"
					disabled={this.state.businesses.length === 0}
					/>
				{ this.state.userSelectedCategory ? <div className="biz-container">
						{
							filteredBusinesses.map((business) => {
								return (
										<BusinessDisplay
											key={business.id}
											business={business}
											id={business.id}
											user={this.state.user}
											handle_add_to_favorites={this.handle_add_to_favorites}
										/>
								)
							})
						}
				</div>
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
		)
	}
}

export default Search
