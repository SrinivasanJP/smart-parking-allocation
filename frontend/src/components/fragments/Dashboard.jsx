import React, { useState, useEffect } from 'react'
import { db } from '../../config/firebase'
import { collection, getDocs } from 'firebase/firestore'
function Dashboard() {
  const [coursesCollections, setCoursesCollections] = useState([])
  useEffect(()=>{
    (async ()=>{
        const courseRef = collection(db, "courses")
        const collectionSnap = await getDocs(courseRef)
        setCoursesCollections([])
        collectionSnap.forEach((doc)=>{
          const newColl = {...doc.data(), id: doc.id}
          setCoursesCollections(old=>[...old, newColl])
        })
    })()
}, [])
  return(
    <div className='text-white'>
      <h1>Hello world!!</h1>
    </div>
  )
}

export default Dashboard