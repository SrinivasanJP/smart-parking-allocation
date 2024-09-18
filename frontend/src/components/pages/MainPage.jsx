import React, { useState, useEffect } from 'react'
import { auth, db } from '../../config/firebase'
import SideBar from '../SideBar'
import { doc, getDoc } from 'firebase/firestore'
import Navigation from '../Navigation';
import { getDatabase,ref,onValue } from 'firebase/database';
function MainPage( {setPage}) {
    
    const [uID, setUID] = useState("");
    const [userData, setUserData] = useState({})
    const [slotData, setSlotData] = useState();
    const SlotElement = ({data}) =>(
      <div className={`w-20 bg-gradient-to-bl h-36 flex justify-center items-center rounded-lg from-green-400/90 flex-col to-transparent ${data.isReserved && " from-red-500"}`}>
        {console.log(data)}
            <h1>{data.id.toUpperCase()}</h1>
            {data.isReserved && <p>Reserved</p>}
          </div>
    )
    const fixJSON = (str) => {
      return str.replace(/([a-zA-Z0-9_]+):/g, '"$1":');
    };
    useEffect(()=>{
      const RT = getDatabase();
      const RTref = ref(RT, "slots");
      onValue(RTref,(snapshot)=>{
        if (snapshot.exists()) {
          const rawData = snapshot.val();
          const parsedData = rawData.map((slotString) => {
            try {
              // Clean up the string and parse as JSON
              const fixedString = fixJSON(slotString);
              return JSON.parse(fixedString);
            } catch (error) {
              console.error("Error parsing JSON:", error);
              return null;
            }
          }).filter(data => data !== null); // Filter out any null values if parsing fails
          setSlotData(parsedData); // Set the parsed data
        } else {
          console.log("No Data available");
        }
      })
    },[])
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
    <div className='text-white flex justify-center items-center p-5 pt-20 flex-col'>
      <Navigation setPage={setPage} loginButton={false}/>
      <section id='Slots booking' className='w-[90%] h-screen flex flex-col lg:flex-row gap-9'>
        <div className='h-full flex-1 backdrop-blur-lg bg-gradient-to-bl from-cyan-600 to-orange-400 p-5 rounded-lg'>
          <h1>Slots</h1>
          <div className='w-full h-full flex flex-wrap gap-5 mt-10'>
          {
            slotData && slotData.map((data, index)=>(<SlotElement data={data} key={index}/>))
          }
          </div>
          
        </div>
        <div className='h-full flex-1 flex flex-col gap-10 '>
          <div className=' flex-1 backdrop-blur-lg bg-gradient-to-r from-cyan-600 to-lime-300/20 p-5 rounded-lg'>
            <h1>Active Slots</h1>
          </div>
          <div className='flex-1 backdrop-blur-lg bg-gradient-to-r from-cyan-600 to-lime-300/20 p-5 rounded-lg'>
            <h1>Profile Details</h1>
            <button onClick={()=>LogOut()} className='bg-gray-500 px-10 text-2xl font-bold rounded-xl py-3 '>
        Logout
      </button>
          </div>
        </div>
      </section>
      
    </div>
  )
}

export default MainPage