import React from 'react';
import './tileDisplay.scss';
import { Link } from 'react-router-dom';
import HomeTeamLogo from '../../styles/assets/HomeTeamWording.png';

	const TileDisplay = (props) => (
		<div className="businessTile">
			<Link key={props.id} to={`/business/${props.id}`}>
				<div className="business-photo-container">
					{
						 props.isLoading ?
						 <img className="titleImage" src={HomeTeamLogo} alt="Hometeam Logo"></img>
						 :
						 <img className="tileImage" src={props.business.coverPhoto} alt={props.business.businessName}></img>
							
					}
				</div>
			</Link>
			<div>
				<div className="votes-container">
					<div className="business-info">
						<div className="business-name">
							{props.business.businessName}
						</div>
						<div className="business-category">
							{props.business.businessCategory}
						</div>
					</div>
				</div>
			</div>
		</div>
	)

export default TileDisplay