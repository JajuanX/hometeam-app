import React from 'react'
import { auth, createUserProfileDocument } from '../../firebase'
import './login.scss'
import { signInWithGoogle, signInWithFacebook } from '../../firebase'
import HomeTeamLogo from '../../styles/assets/HomeTeamWording.png'
import FacebookLogo from '../../styles/assets/facebookLogo.png'
import GoogleLogo from '../../styles/assets/googleLogo.png'

// import EmailPasswordLogIn from '../components/email-password-login/EmailPasswordLogIn'

class App extends React.Component {
	state = { 
		serverMessage: '',
		user: null,
		stars: 0,
		email: '',
		password: '',
	}

	unsubscribeFromAuth = null; 

	componentDidMount = async () => {
		this.unsubscribeFromAuth = auth.onAuthStateChanged( async userAuth => {
			
			const user = await createUserProfileDocument(userAuth)
			this.setState({ user });
			if (user) {
				this.props.history.push('/home');
			}
		}); 
	}

	componentWillUnmount = () => {
		this.unsubscribeFromAuth();

	}

	handleChange = (event) => {
		this.setState({[event.target.name]: event.target.value})  
	}

	// signUp = () => {
	// 	const { userEmail, userPassword } = this.state;
	// 	auth.createUserWithEmailAndPassword(userEmail, userPassword).then((user) => {
	// 		this.setState({ user });
	// 		createUserProfileDocument( user, {})
	// 	})
	// }
	// signIn = () => {
	// 	const userEmail = this.state.email;
	// 	const userPassword = this.state.password;
	// 	auth.signInWithEmailAndPassword(userEmail, userPassword).then((user) => {
	// 		this.setState({ user });
	// 		createUserProfileDocument( user, {})
	// 	})
	// }

  render(){
    return (
		<div id="loginPage">
			{/* <EmailPasswordLogIn 
				email={this.state.email} 
				password={this.state.password}
				handleChange={this.handleChange} 
				submit={this.signIn}
				/> */}
			<div className="container">
				<img src={HomeTeamLogo} alt="Hometeam Logo"></img>
				<div className="login-with-container">
					<div id="facebook" className="button">
						<img src={FacebookLogo} alt="facebook"></img>
						<span onClick={signInWithFacebook} ><strong>Continue with FaceBook</strong></span>
					</div>
					<div id="google" className="button">
						<img src={GoogleLogo} alt="google"></img>
						<span onClick={signInWithGoogle} ><strong>Continue with Google</strong></span>
					</div>
				</div>
			</div>
		</div>
    )
  }
}

export default App
