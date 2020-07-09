import React from 'react'
import '../styles/businessTimeLine.css'

    const BusinessTimeLine = (props) => (
        <div className="businessTimeLine">
            <div className="tlPage">
              <div className="addContent">

              </div>
              <div className="commentBox">
              {
                props.businesses.map((business) => {
                    console.log(business);
                    
                  return (
                      <div key={business.id} className="comments">
                        <div>
                            <img alt='profile pic' className="profilePic" src={business.user.photoURL}></img>
                        </div>
                        <div className="commentInfo">
                          <div>
                            <div>
                              {business.name}
                            </div>
                            <div>
                              {business.description}
                            </div>
                            <div>
                              {business.address}
                            </div>
                          </div>
                          <div className="buttons">
                            <div className="button" onClick={() => props.handleRemove(business.id)}>Delete</div>
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

export default BusinessTimeLine