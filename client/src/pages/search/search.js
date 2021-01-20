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

	searchForCategory = async (category) =>  {
		this.setState({ isLoading: true})

		this.unsubscribeFromBusinesses = await firestore.collection('businesses')
			.where('businessCategory', '==', `${category}`)
			.get();
		let results = this.unsubscribeFromBusinesses.docs.map(collectIdsandDocs);
		this.setState({businesses: results, isLoading: false, userSelectedCategory: true, category}, () => this.handle_user_favorites)
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

		console.log(this.state.businesses);
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
				{ this.state.userSelectedCategory ? <div className="biz-container">
						{
							this.state.businesses.map((business) => {
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
