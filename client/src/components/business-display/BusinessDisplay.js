import React from 'react';
import './businessDisplay.scss';
import { Link } from 'react-router-dom';
import HomeTeamLogo from '../../styles/assets/HomeTeamWording.png';


	const BusinessDisplay = (props) => (
		<div id="businessDisplay">
			<Link key={props.id} to={`/business/${props.id}`} className="business-tile"  style={{textDecoration: 'none', color: 'black'}}>
				<div className="business-photo-container">
					{
						props.businessbusinessPhoto ?
						<img className="titleImage" src={HomeTeamLogo} alt="Hometeam Logo"></img>
						:
						<img className="tileImage" src={props.business.coverPhoto} alt={props.business.businessName}></img>
							
					}
				</div>
					
				<div className="info-container">
					<div className="business-name">
						{props.business.businessName}
					</div>
					<div className="business-category">
						{props.business.businessCategory}
					</div>
				</div>
			</Link>
			<div className="directions">
				<a target="_blank" 
					rel="noopener noreferrer"
					href={`https://www.google.com/maps/search/?api=1&query=${props.business.coordinates.oa},${props.business.coordinates.ha}`}>Go Here Now</a>
			</div>
		</div>
		
	)

export default BusinessDisplay