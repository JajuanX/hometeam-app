import React from 'react'
import { firestore, auth, signOut } from './firebase'
import './App.css'
import { collectIdsandDocs } from './utils/utilities'
import LogIn from './components/LogIn'
import TimeLine from './components/TimeLine'

class App extends React.Component {
  state = { 
    serverMessage: '',
    posts: [],
    post: [],
    title: '',
    content: '',
    user: null,
    stars: 0,
  }

  unsubscribeFromFirestore = null;
  unsubscribeFromAuth = null; 

  componentDidMount = async () => {
    fetch('/api/demo')
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
      })

      this.unsubscribeFromFirestore = firestore.collection('posts').onSnapshot( snapshot => {
        const posts = snapshot.docs.map(collectIdsandDocs);
        this.setState({ posts })
      }); 
      this.unsubscribeFromAuth = auth.onAuthStateChanged( user => {
        this.setState({ user })
        console.log(user);
      }); 

  }

  componentWillUnmount = () => {
    this.unsubscribe();
    this.unsubscribeFromFirestore();

  }
  handleCreate = async event => {
    event.preventDefault();
    const { title, content, stars } = this.state;
    const { uid, displayName, email, photoURL } = auth.currentUser || {}
    const post = {
      title,
      content,
      user: {
        uid,
        displayName,
        email,
        photoURL,
      },
      stars
    }
    firestore.collection('posts').add(post);
  }

  handleRemove = async id => {
    firestore.doc(`posts/${id}`).delete();
  }

  handleChange = (event) => {
    this.setState({[event.target.name]: event.target.value})  
  }

  // handleSignIn = () => {
  //   signInWithGoogle
  // }

  star = (post) => {
    let postRef = firestore.doc(`posts/${post.id}`)
    postRef.update({stars: post.stars + 1})
  }

  render(){
    return (
      <div id="site">
        { 
          this.state.user === null ?
            <LogIn />
            :
            <div>
              <button onClick={ signOut }>Sign Out</button>
              <TimeLine 
                user={this.state.user}
                handleCreate={this.handleCreate} 
                handleChange={this.handleChange} 
                star={this.star} 
                handleRemove={this.handleRemove}
                posts={this.state.posts}
                />
            </div>
        }
         
      </div>
    )
  }
}

export default App
