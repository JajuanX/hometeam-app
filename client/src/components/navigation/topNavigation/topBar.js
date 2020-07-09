import React from 'react'
import '../../../styles/navBar.css'
import { Link } from 'react-router-dom'
import PlusSymbol from '../../../styles/assets/plus'
import MagnifyingGlass from '../../../styles/assets/magnifyingGlass'

// Replace words with Icons hat represent each link
const TopBar = () => (
        <div className="navBarContainer">
            <div id="NavBar">
                <Link to="/search" >
                    <MagnifyingGlass />
                </Link>
                <Link to="/create-business">
                    <PlusSymbol />
                </Link>
            </div>
        </div>
)

export default TopBar