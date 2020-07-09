import React from 'react';
import CreateBusiness from  '../pages/createBusiness/CreateBusiness'
import Home from  '../pages/Home'
import Posts from  '../pages/Posts'
import Login from  '../pages/Login'
import './App.css';
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import TopBar from '../components/navigation/topNavigation/topBar'

function App() {
  return (
	<BrowserRouter>
	<TopBar />
		<Switch>
			<Route path='/home' component={Home}/>
			<Route path='/create-business' component={CreateBusiness}/>
			<Route path='/posts' component={Posts}/>
			<Route path='/' component={Login}/>

		</Switch>
	</BrowserRouter>
  );
}

export default App;