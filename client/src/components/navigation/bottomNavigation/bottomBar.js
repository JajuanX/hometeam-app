import React from 'react';
import '../navBar.scss';
import { Link } from 'react-router-dom';
import MapMarker from '../../../styles/assets/map-marker.png';
import HomeTeam from '../../../styles/assets/HomeTeamNoWords.png';
import Search from '../../../styles/assets/search.png';
import Add from '../../../styles/assets/add.png';
import NavigationModal from '../../navigation-modal/NavigationModal';


// Replace words with Icons hat represent each link
class BottomBar extends React.Component {
	state = {
		modalOpen: false,

	}

	toggleModal = () => {
		this.setState(prevState => ({
			modalOpen: !prevState.modalOpen
		  }),() => this.addchecklistener());	
		
	}

	addchecklistener = () => {
		if (this.state.modalOpen) {
			window.addEventListener('click', this.outsideClick);
		} else {
			window.removeEventListener('click', this.outsideClick);
		}
	}

	outsideClick = (e) => {
		console.log(e.target);
		if (e.target.name !== "modal") {
			this.setState({modalOpen: false})
			window.removeEventListener('click', this.outsideClick);

		}
		
	}

	componentWillUnmount = () => {
		window.removeEventListener('click', this.outsideClick);
	}


	render(){
		return (
			<div id="bottom-navbar">
				<div className="button-container">
					<Link to={`/home`}><img src={HomeTeam} alt="Hometeam"></img></Link>
					<Link to={`/map`}><img src={MapMarker} alt="Map Marker"></img></Link>
					<Link to={`/create-business`}><img src={Add} alt="Map Marker"></img></Link>
					<Link to={`/search`}><img src={Search} alt="Search"></img></Link>
					<NavigationModal 
						modalOpen={this.state.modalOpen}
						toggleModal={this.toggleModal}
						shouldCloseOnOverlayClick={false}
					/>
				</div>
			</div>
		)
	}
}

export default BottomBar