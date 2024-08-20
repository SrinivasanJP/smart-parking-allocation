import React, { useState, useEffect } from 'react'
import { auth, db } from '../../config/firebase'
import SideBar from '../SideBar'
import { doc, getDoc } from 'firebase/firestore'
function MainPage( {setPage}) {
    
    const [uID, setUID] = useState("");
    const [userData, setUserData] = useState({})
  
    // useEffect(()=>{
    // (async()=>{
    //   try{
    //   const docRef = doc(db, "user", uID);
    //   const docSnap = await getDoc(docRef);
    //   if(docSnap.exists()){
    //     setUserData(docSnap.data());
    //   }
    //   else{
    //     console.log("NO doc found");
    //   }
    // }catch(err){
    //   console.log("UID not loaded")
    // }
    // })();
    // },[uID]);
    // useEffect(()=>{
    //   auth.onAuthStateChanged((user) =>{
    //     if(user){
    //       setUID(user.uid)
    //     }else{
    //       console.log("Auth error")
    //     }
    //   })
    // }, []);
    const LogOut = () =>{
      auth.signOut().then(()=>{ 
        setPage("home")
      }).catch((e)=>{
    console.log(e.messgage);
      });
    }
    
  return (
    <div className='text-white flex justify-center items-center p-10'>
      <button onClick={()=>LogOut()} className='bg-gray-500 px-10 text-2xl font-bold rounded-xl py-3 '>
        Logout
      </button>
    </div>
  )
}

export default MainPage