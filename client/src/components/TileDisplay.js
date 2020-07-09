import React from 'react'
import './components.css'

	const TileDisplay = (props) => (
		<div>
			<div>
				{
					typeof props.items.businessPhoto === 'string'  ? 
						<img className="tileImage" src={props.items.businessPhoto} alt={props.items.businessName}></img> :
						<div className="uploadPhoto">Upload Photo</div>
				}
			</div>
			<div>
				{props.items.businessName}
			</div>
		</div>
	)

export default TileDisplay