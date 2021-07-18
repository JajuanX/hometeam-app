import React from 'react'
import '../navBar.scss'
import { Link } from 'react-router-dom'
import HomeTeamLogo from '../../../styles/assets/HomeTeamWords.png';

// Replace words with Icons hat represent each link
const TopBar = (props) => {
	return (
	<div id="navBarContainer">
		<div id="NavBar">
			<div>
				<img src={HomeTeamLogo} alt="hometeam"></img>
			</div>
			<Link to="/user-profile">
				{	props.user && props.user.photoURL ?
						<img className="profile-picture" src={props.user && props.user.photoURL} alt="User profile"></img>
						: null
				}
			</Link>
		</div>
	</div>
	)
		
}

export default TopBar