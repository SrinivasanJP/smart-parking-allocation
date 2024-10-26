import React, { useState, useEffect } from 'react'
import { auth, db } from '../../config/firebase'
import SideBar from '../SideBar'
import { doc, getDoc } from 'firebase/firestore'
import Navigation from '../Navigation';
import { getDatabase,ref,onValue,update } from 'firebase/database';
function MainPage( {setPage}) {
    
    const [uID, setUID] = useState("");
    const [userData, setUserData] = useState({})
    const [slotData, setSlotData] = useState();
    const handleSlotClick = async (slotId) => {
      try {
          // Find and update the slot in the local state
          const updatedSlots = slotData.map(slot => {
              if (slot.id === slotId) {
                if(slot.isReserved){
                  alert("Slot is already reserved")
                }else{
                  var updatedSlot = { userID:userData.RFID, isReserved: !slot.isReserved };
                  // Update the value in Firebase Realtime Database
                  const RT = getDatabase();
                  const slotRef = ref(RT, `slots/${slotId}`);
                  update(slotRef, updatedSlot);
                  updatedSlot = {id:slotId,...updatedSlot}
                  // Return the updated slot
                  return updatedSlot;}
              }
              return slot;
          });
          setSlotData(updatedSlots);
      } catch (error) {
          console.error("Error updating slot:", error);
      }
  };
  
    const SlotElement = ({data}) =>(
      <div className={`w-20 bg-gradient-to-bl h-36 flex justify-center items-center rounded-lg from-green-400/90 flex-col to-transparent cursor-pointer ${data.isReserved && " from-red-500 cursor-no-drop"}` } onClick={()=>{handleSlotClick(data.id)}}>
        {console.log(data)}
            <h1>{data.id.toUpperCase()}</h1>
            {data.isReserved && <p>Reserved</p>}
          </div>
    )
    useEffect(()=>{
      const RT = getDatabase();
      const RTref = ref(RT, "slots");
      onValue(RTref,(snapshot)=>{
        if (snapshot.exists()) {
          console.log(snapshot.val());
          var dataArray = [];
          for(var i in snapshot.val())
            dataArray.push({id:i,...snapshot.val()[i]});
          setSlotData(dataArray);
        } else {
          console.log("No Data available");
        }
      })
    },[])
    useEffect(()=>{
    (async()=>{
      try{
      const docRef = doc(db, "user", uID);
      const docSnap = await getDoc(docRef);
      if(docSnap.exists()){
        setUserData(docSnap.data());
      }
      else{
        console.log("NO doc found");
      }
    }catch(err){
      console.log("UID not loaded")
    }
    })();
    },[uID]);
    useEffect(()=>{
      auth.onAuthStateChanged((user) =>{
        if(user){
          setUID(user.uid)
        }else{
          console.log("Auth error")
        }
      })
    }, []);
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
        <div className='h-full flex-1 backdrop-blur-lg bg-gradient-to-br to-cyan-600 from-orange-400 p-5 rounded-lg'>
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
          <div className='flex-1 backdrop-blur-lg bg-gradient-to-r from-cyan-600/20 to-lime-300/10 p-5 rounded-lg flex flex-col shadow-md shadow-white'>
            <h1 className='text-3xl font-bold'>Profile Details</h1>
            <table className='min-w-full mt-5 h-full'>
    
                <tbody>
                <tr>
                        <td className='border-b border-gray-200 py-2'>Student Name</td>
                        <td className='border-b border-gray-200 py-2'>{userData.studentName}</td>
                    </tr>
                    <tr>
                        <td className='border-b border-gray-200 py-2'>RFID</td>
                        <td className='border-b border-gray-200 py-2'>{userData.RFID}</td>
                    </tr>
                    <tr>
                        <td className='border-b border-gray-200 py-2'>Email</td>
                        <td className='border-b border-gray-200 py-2'>{userData.email}</td>
                    </tr>
                    <tr>
                        <td className='border-b border-gray-200 py-2'>Address</td>
                        <td className='border-b border-gray-200 py-2'>{userData.address}</td>
                    </tr>
                    <tr>
                        <td className='border-b border-gray-200 py-2'>Date of Birth</td>
                        <td className='border-b border-gray-200 py-2'>{userData.dob}</td>
                    </tr>

                    <tr>
                        <td className='border-b border-gray-200 py-2'>Gender</td>
                        <td className='border-b border-gray-200 py-2'>{userData.gender}</td>
                    </tr>
                    <tr>
                        <td className='border-b border-gray-200 py-2'>Phone Number</td>
                        <td className='border-b border-gray-200 py-2'>{userData.phoneNumber}</td>
                    </tr>
                   
                </tbody>
            </table>
            <button onClick={()=>LogOut()} className=' border-white mt-5 border-2 px-10 text-2xl font-bold rounded-xl py-3  '>
        Logout
      </button>
          </div>
        </div>
      </section>
      
    </div>
  )
}

export default MainPage