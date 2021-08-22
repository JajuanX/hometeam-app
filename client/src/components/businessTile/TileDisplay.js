import React from 'react';
import './tileDisplay.scss';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';

	const TileDisplay = (props) => (
			<Link key={props.id} to={`/business/${props.id}`} className="business-tile">
				<div className="business-photo-container">
					<LazyLoadImage className="tileImage" src={props.business?.coverPhoto} alt={props.business.businessName}/>		
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

export default TileDisplay