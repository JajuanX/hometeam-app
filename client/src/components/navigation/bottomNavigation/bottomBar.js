import React from 'react'
import '../navBar.scss'
import { Link } from 'react-router-dom'
import MapMarker from '../../../styles/assets/map-marker.png';
import HomeTeam from '../../../styles/assets/HomeTeamNoWords.png';
import Search from '../../../styles/assets/search.png';


// Replace words with Icons hat represent each link
const BottomBar = (props) => (
	<div id="bottom-navbar">
		<div className="button-container">
			<Link to={`/home`}><img src={HomeTeam} alt="Hometeam"></img></Link>
			<Link to={`/map`}><img src={MapMarker} alt="Map Marker"></img></Link>
			<Link to={`/search`}><img src={Search} alt="Search"></img></Link>
		</div>
	</div>
)

export default BottomBar