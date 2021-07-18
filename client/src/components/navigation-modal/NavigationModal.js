import React from 'react'
import './navigationModal.scss'
import HamburgerMenu from '../../styles/assets/hamburger-menu.png';


const NavigationModal = (props) => (
		<div id="navigationMenu" name="modal">
			<img name="modal" alt="menu" src={HamburgerMenu} 
				onClick={props.toggleModal}
			></img>
			<div name="modal" className={`${props.modalOpen ? "modal-open" : "modal-closed" }`}>
				<button type="button" onClick={props.toggleModal}></button>
				<div name="modal" className="navigation-items">
					<div name="modal">About The Team</div>
					<div name="modal">HomePlans</div>
					<div name="modal">Shop HomeTeam </div>
					<div name="modal">The Team</div>
					<div name="modal">Contact Us</div>
					<div name="modal">Terms and Conditions</div>
				</div>
			</div>
		</div>
)

export default NavigationModal