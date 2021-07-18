import React from 'react'
import './subscribe.scss'

// Replace words with Icons hat represent each link
const Subscribe = (props) => (
	<div id="subscribe">
		<div className="subscribe-container">
			<div className="subscribe-instructions">
				<p>Follow these simple steps.</p>
				<div className="subscribe-step">
					<div className="number">1.</div>
					<div className="info">
						<div className="info-title">Subscribe to the HomeTeam</div>
						<div className="info-text">Subscribing to the HomeTeam gets you access to add your business to our database.</div>
					</div>
					<button type="button" disabled={props.isActive === "active" ? true : false} onClick={props.subscribe}>Subscribe</button>
				</div>

				<div className="subscribe-step two">
					<div className="number">2.</div>
					<div className="info">
						<div className="info-title">Create Your Business Profile</div>
						<div className="info-text">Once you subscribe to hometeam, you'll have access to creating your business.</div>
					</div>
					{ 
						props.user && props.user.userBusinesses >= 1 ?
							<button type="button" onClick={props.toggleCreate}>Edit Your Business</button> :
							<button type="button" disabled={!props.isActive} onClick={props.toggleCreate}>Create</button>
					}
				</div>

				<div className="subscribe-step two">
					<div className="number">3.</div>
					<div className="info">
						<div className="info-title">Get Approved</div>
						<div className="info-text">After your business is approved it will be available on the platform for viewing.</div>
					</div>
				</div>
				
			</div>
		</div>
	</div>
)

export default Subscribe