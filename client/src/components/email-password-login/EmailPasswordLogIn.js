import React from 'react'
import './EmailPasswordLogIn.scss'


const EmailPasswordLogIn = (props) => (
	<div id="email-login">
		<form onSubmit={props.submit}>
			<input
				placeholder='Email'
				type="text"
				name="email"
				value={props.email}
				onChange={props.handleChange}
				autoComplete="off"
				/>
			<input
				placeholder='Password'
				type="text"
				name="password"
				value={props.password}
				onChange={props.handleChange}
				autoComplete="off"
				/>
			<button type="submit">Sign Up</button>
		</form>
	</div>
)

export default EmailPasswordLogIn