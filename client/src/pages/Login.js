import React from 'react'
import { auth, signOut } from '../firebase'
import '../App.css'
import '../styles/logIn.css'
import LogIn from '../components/LogIn'


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
      this.unsubscribeFromAuth = auth.onAuthStateChanged( user => {
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

  signUp = () => {
    const userEmail = this.state.email;
    const userPassword = this.state.password;
    console.log(userEmail, userPassword);
    auth.createUserWithEmailAndPassword(userEmail, userPassword).then((cred) => {
      this.setState({ user: cred });
      console.log(cred);
    })
  }
  signIn = () => {
    const userEmail = this.state.email;
    const userPassword = this.state.password;
    auth.signInWithEmailAndPassword(userEmail, userPassword).then((cred) => {
      this.setState({ user: cred });
      console.log(cred);
    })
  }

  render(){
    return (
      <div id="site">
            <LogIn 
              signUp={this.signUp} 
              signIn={this.signIn}
              email={this.state.email} 
              password={this.state.password}
              handleChange={this.handleChange} 
              />
            <div>
              <button onClick={ signOut }>Sign Out</button>
            </div>
        </div>
    )
  }
}

export default App
