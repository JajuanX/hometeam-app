import React from 'react'
import { signOut } from '../firebase'
import '../styles/logIn.css'
import { Link } from 'react-router-dom'


const LogOutButton = () => (
        <Link to={'/login'}>
            <button onClick={ signOut }>Sign Out</button>
        </Link>
)

export default LogOutButton