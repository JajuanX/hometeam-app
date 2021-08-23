import React, { useState } from 'react';
import './tileDisplay.scss';
import { Link } from 'react-router-dom';

const TileDisplay = (props) => {
	const [loaded, setLoaded] = useState(false);

	return (
		<Link key={props.business.id} to={`/business/${props.business.id}`} className="business-tile">
			<div className="business-photo-container">
				{	loaded ? null : (
						<div
							style={{
								background: 'lightgrey',
								borderRadius: '15px',
								height: '200px',
								width: '160px',
								marginBottom: '3px',
							}}
						/>)
				}
				<img className="tileImage" 
					style={ loaded ? null : {display: 'none'}} 
					src={props.business.coverPhoto} 
					alt={props.business.name} 
					onLoad={() => setLoaded(true)}
				/>
			</div>

			<div className="business-info">
				<div className="business-name">
					{props.business.name}
				</div>
				<div className="business-category">
					{props.business.category}
				</div>
			</div>
		</Link>
	)
}

export default TileDisplay