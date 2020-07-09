import React from 'react'
import '../styles/navBar.css'
import { Link } from 'react-router-dom'
import HomeSVG from '../../../styles/assets/homesvg'

// Replace words with Icons hat represent each link
const BottomBar = () => (
    <div className="navBarContainer">
        <div id="NavBar">
            <Link to="/home"><HomeSVG /></Link>
        </div>
    </div>
)

export default BottomBar