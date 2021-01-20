import React from 'react'
import './socialMediaButton.css'

// To use this button you need to pass in the function from the top level component onClick, 
//and the name you want to appear on the pill itself. 

const SocialMediaButton = (props) => (
		<a href={props.link} key={props.index} target="_blank" rel="noopener noreferrer" >
			<div className={`mediaPill ${props.color}`}>{props.text}</div>
		</a>
)

export default SocialMediaButton