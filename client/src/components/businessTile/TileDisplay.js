import React, { useState } from 'react';
import './tileDisplay.scss';
import { Link } from 'react-router-dom';

const TileDisplay = (props) => {
	const [loaded, setLoaded] = useState(false);

	return (
		<Link key={props.business.id} to={`/business/${props.business.id}`} className="business-tile">
			<div className="business-photo-container">
				<img
					style={ loaded ? null : {display: 'none'}} 
					className="tileImage" 
					src={props.business?.coverPhoto} 
					alt={props.business?.businessName} 
					onLoad={() => setLoaded(true)}/>		
			</div>

			<div className="business-info">
				<div className="business-name">
					{props.business?.businessName}
				</div>
				<div className="business-category">
					{props.business?.businessCategory}
				</div>
			</div>
		</Link>
	)
}

export default TileDisplay