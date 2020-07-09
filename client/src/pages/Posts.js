import React from 'react'
import { firestore, auth } from '../firebase'
import '../App.css'
import '../styles/postTimeLine.css'
import { collectIdsandDocs } from '../utils/utilities'
import PostTimeLine from '../components/PostTimeLine'
import LogOutButton from '../components/LogOutButton'
import TopBar from '../components/navigation/topNavigation/topBar'

class Posts extends React.Component {
  state = { 
    serverMessage: '',
    posts: [],
    post: [],
    title: '',
    content: '',
    user: null,
    stars: 0,
  }

  unsubscribeFromStore = null;
  unsubscribeFromAuth = null; 

  componentDidMount = async () => {
      this.unsubscribeFromStore = firestore.collection('posts').onSnapshot( snapshot => {
        const posts = snapshot.docs.map(collectIdsandDocs);
        this.setState({ posts })
      }); 
      this.unsubscribeFromAuth = auth.onAuthStateChanged( user => {
        this.setState({ user })
        if (user === null) {
          this.props.history.push('/login')

        }
      }); 
  }

  componentWillUnmount = () => {
    this.unsubscribeFromAuth();
    this.unsubscribeFromStore();

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

  star = (post) => {
    let postRef = firestore.doc(`posts/${post.id}`)
    postRef.update({stars: post.stars + 1})
  }

  render(){
    return (
        <div id="site">
            <div>
                <LogOutButton />
                <PostTimeLine 
                user={this.state.user}
                handleCreate={this.handleCreate} 
                handleChange={this.handleChange} 
                star={this.star} 
                handleRemove={this.handleRemove}
                posts={this.state.posts}
                />
                <TopBar />
            </div>
        </div>
    )
  }
}

export default Posts
