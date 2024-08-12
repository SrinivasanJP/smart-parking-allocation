import React, { useState } from 'react'
import Navigation from '../Navigation'
import planet from '../../assets/svgs/3dPlanet.png'
import planet2 from '../../assets/svgs/p2.png'
import woman3d from '../../assets/svgs/3dWomanLaptop.png'
const Home = ({setPage}) => {
  const spanD = 'w-2 h-2 bg-[#4D78EF] inline-block rounded-full mr-5 animate-pulse'
  const liD = ' bg-gradient-to-r  from-slate-950 px-5 py-3 rounded-2xl mt-3'
  const liED = ' bg-gradient-to-r  from-slate-950 px-5 py-3 rounded-2xl mt-3'

  const [contactData, setContactData]= useState({
    name: '',
    email: '',
    message: '',
    submitted: false,
  })
  const handleSubmit = (e)=>{
    e.preventDefault()
    setContactData({...contactData,submitted:true})
  }
  const handleChange = (e)=>{
    setContactData({...contactData,[e.target.name]:e.target.value})
  }
  return (
    <div id="home" className="mt-[66px]"
    >
      <Navigation setPage={setPage}/>
      //TODO: layout
    </div>
    
  )
}

export default Home