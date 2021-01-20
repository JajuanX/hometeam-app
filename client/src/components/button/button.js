import React from 'react'
import './button.css'

// To use this button you need to pass in the function from the top level component onClick, 
//and the name you want to appear on the pill itself. 

const Button = (props) => (
	<div className={`pill ${props.color}`} onClick={() => props.clickEvent()}>{props.text}</div>
)

export default Button