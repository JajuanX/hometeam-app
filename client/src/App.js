import React from 'react';
import CreateBusiness from  './pages/create-business/CreateBusiness'
import Home from  './pages/home/Home'
import Login from  './pages/login/Login'
import Search from  './pages/search/search'
import Business from './pages/business/Business'
import UserProfile from './pages/user-profile/UserProfile'
import BottomBar from './components/navigation/bottomNavigation/bottomBar'
import './App.scss';
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import BusinessMap from './pages/business-map/BusinessMap';

function App() {
  return (
	<BrowserRouter>
		<Switch>
			<Route path='/home' component={Home}/>
			<Route path='/business/:id' component={Business}/>
			<Route path='/create-business' component={CreateBusiness}/>
			<Route path='/user-profile' component={UserProfile}/>
			<Route path='/map' component={BusinessMap}/>
			<Route path='/search' component={Search}/>
			<Route path='/' component={Login}/>
		</Switch>
		<BottomBar />
	</BrowserRouter>
  );
}

export default App;