import React from 'react'

    const TimeLine = (props) => (
        <div>
            <div>
              <form onSubmit={ props.handleCreate }>
              <label>Title:</label>
                <input
                  type="text"
                  name="title"
                  value={props.title}
                  onChange={props.handleChange}
                  autoComplete="off"
                  />
                  <br></br>
                  
                <label>Content:</label>
                <input
                  type="text"
                  name="content"
                  value={props.content}
                  onChange={props.handleChange}
                  autoComplete="off"
                  />
                  <button type="submit">Add new post</button>
              </form>
              <div>
              {
                props.posts.map((post) => {
                  return (
                    <div key={post.id}>
                      <h1>
                        {post.title}
                      </h1>
                      <p>
                        {post.content}
                      </p>
                      <p>
                        {post.stars}
                      </p>
                      <button onClick={() => props.star(post)}>add star</button>
                      <button onClick={() => props.handleRemove(post.id)}>Delete</button>
                    </div>
                  )
                })
              }
              </div>
            </div>
        </div>
    )

export default TimeLine