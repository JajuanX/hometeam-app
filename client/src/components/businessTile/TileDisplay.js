import React from 'react';
import './tileDisplay.scss';
import { Link } from 'react-router-dom';

	const TileDisplay = (props) => (
			<Link key={props.id} to={`/business/${props.id}`} className="business-tile">
				<div className="business-photo-container">
					<img className="tileImage" src={props.business.coverPhoto} alt={props.business.businessName}></img>		
				</div>

				<div className="business-info">
					<div className="business-name">
						{props.business.businessName}
					</div>
					<div className="business-category">
						{props.business.businessCategory}
					</div>
				</div>
			</Link>
	)

export default TileDisplay