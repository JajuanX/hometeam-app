import React from 'react'
import { signInWithGoogle } from '../firebase'

const LogIn = (props) => (

<div id="loginPage">
  <div className='logInContainer'>
    <div className='introSide'>
      Welcome to Home Team
    </div>
    <div className='loginSide'>
        <div className='formInput'>
          <input
            placeholder='Email'
            type="text"
            name="title"
            value={props.email}
            onChange={props.handleChange}
            autoComplete="off"
          />
            <br></br>
            
          <input
            placeholder='Password'
            type="text"
            name="content"
            value={props.password}
            onChange={props.handleChange}
            autoComplete="off"
          /><br></br>
          <button type="submit">Sign Up</button>
        </div>
      <button onClick={signInWithGoogle} >Log In with Google</button>
    </div>
  </div>
</div>
)

export default LogIn