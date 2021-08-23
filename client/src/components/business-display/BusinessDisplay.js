import React from 'react';
import './businessDisplay.scss';
import FaceBook from '../../styles/assets/social-media/facebookLogo.png';
import Instagram from '../../styles/assets/social-media/instagram.jpg';
import Web from '../../styles/assets/social-media/website.png';
import Twitter from '../../styles/assets/social-media/twitter.png';
import YouTube from '../../styles/assets/social-media/youtube.png';
import Email from '../../styles/assets/social-media/email.png';

	const BusinessDisplay = (props) => (
		<div id="businessDisplay" >
			<div className="info-container">
				<div className="business-name">
					{props.business.name}
				</div>
				<div className="business-category">
					{props.business.category}
				</div>
				<div className="phone-number">
					<a href={`tel:${props.business.phoneNumber}`}><p>{props.business.phoneNumber}</p></a>
				</div>
			</div>
			<a target="_blank" 
					rel="noopener noreferrer"
					href={`https://www.google.com/maps/search/?api=1&query=${props.business.coordinates.Rc},${props.business.coordinates.Ac}`}>
				<div className="open-map">
					Open in Maps
				</div>
			</a>
			<div className="section">
				<div className="feature-photo-container">
					{props.business.featurePhoto1 && 
						<img
							className="feature-photo"
							src={props.business.featurePhoto1}
							alt="Hello World!"
						></img>
					}
					{props.business.featurePhoto2 && <img className="feature-photo" alt="Feature 2" src={props.business.featurePhoto2}></img>}
					{props.business.featurePhoto3 && <img className="feature-photo" alt="Feature 3" src={props.business.featurePhoto3}></img>}

				</div>
			</div>
			<div>
				{props.business.socialMedia && props.business.socialMedia.instagram ? <div className="social-media">
					<h1> Follow Us On </h1>
					<div className="social-container">
						{ 
						props.business.socialMedia && props.business.socialMedia.instagram ? 
							<a target="_blank" rel="noopener noreferrer" href={props.business.socialMedia.instagram}><img className="social-media-icons" alt="instagram" src={Instagram}></img></a> : null
					}
						{ 
						props.business.socialMedia && props.business.socialMedia.twitter ? 
							<a target="_blank" rel="noopener noreferrer" href={props.business.socialMedia.twitter}><img className="social-media-icons" alt="twitter" src={Twitter}></img></a> : null
					}
						{ 
						props.business.socialMedia && props.business.socialMedia.facebook ? 
							<a target="_blank" rel="noopener noreferrer" href={props.business.socialMedia.facebook}><img className="social-media-icons" alt="facebook" src={FaceBook}></img></a> : null
					}
						{ 
						props.business.socialMedia && props.business.socialMedia.website ? 
							<a target="_blank" rel="noopener noreferrer" href={props.business.socialMedia.website}><img className="social-media-icons" alt="web" src={Web}></img></a> : null
					}
						{ 
						props.business.socialMedia && props.business.socialMedia.email ? 
							<a target="_blank" rel="noopener noreferrer" href={props.business.socialMedia.email}><img className="social-media-icons" alt="email" src={Email}></img></a> : null
					}
					{ 
						props.business.socialMedia && props.business.socialMedia.youtube ? 
							<a target="_blank" rel="noopener noreferrer" href={props.business.socialMedia.youtube}><img className="social-media-icons" alt="youtube" src={YouTube}></img></a> : null
					}
					</div>
				</div> : null }
				<p className="business-description">{props.business.description}</p>
			</div>
		</div>
		
	)

export default BusinessDisplay