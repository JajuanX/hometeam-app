import React from 'react'
import '../styles/postTimeLine.css'

    const Posts = (props) => (
        <div className="timeLine">
            <div className="postsPage">
              <div className="addContent">
                <form onSubmit={ props.handleCreate }>
                  <input
                  className="input"
                    placeholder="Title"
                    type="text"
                    name="title"
                    value={props.title}
                    onChange={props.handleChange}
                    autoComplete="off"
                    />
                    <br></br>
                    <input
                    className="input"
                    placeholder="Content"
                    type="text"
                    name="content"
                    value={props.content}
                    onChange={props.handleChange}
                    autoComplete="off"
                    />
                    <div onClick={props.handleCreate} className="button">New post</div>
                </form>
              </div>
              <div className="allPosts">
              {
                props.posts.map((post) => {
                  return (
                      <div key={post.id} className="post">
                        <div className="postInfo">
                          <div>
                            <img alt='profile pic' className="profilePic" src={post.user.photoURL}></img>
                          </div>
                          <div>
                            <div>
                              {post.title}
                            </div>
                            <div>
                              {post.content}
                            </div>
                          </div>
                          <div className="buttons">
                            <div className="button" onClick={() => props.star(post)}><span role="img" aria-label="star">⭐️</span>{post.stars}</div>
                            <div className="button" onClick={() => props.handleRemove(post.id)}>Delete</div>
                          </div>
                        </div>
                      </div>
                  )
                })
              }
              </div>
            </div>
        </div>
    )

export default Posts