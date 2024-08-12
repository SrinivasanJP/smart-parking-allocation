import React, { useState } from 'react'
import Navigation from '../Navigation'

const Home = ({setPage}) => {

  return (
    <div id="home" className="mt-[66px]"
    >
      <Navigation setPage={setPage}/>
      {/*TODO: layout */}
    </div>
    
  )
}

export default Home