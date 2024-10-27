import React, { useState, useEffect } from 'react'
import { auth, db } from '../../config/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import Navigation from '../Navigation';
import { getDatabase,ref,onValue,update,set } from 'firebase/database';
function MainPage( {setPage}) {
    
    const [uID, setUID] = useState("");
    const [userData, setUserData] = useState({})
    const [slotData, setSlotData] = useState();
    const setSlotinUser = async (slot, status) => {
      try {
        const docRef = doc(db, "user", uID);
        let preTimeStamps = userData?.slotDetails?.timeStamps || [];
        preTimeStamps.push({ ts: Date.now(), status: status });
        
        // Using merge: true to avoid overwriting the whole document
        await setDoc(docRef, { 
          slotDetails: { 
            slot: slot, 
            status: status, 
            timeStamps: preTimeStamps 
          }
        }, { merge: true });
      } catch (error) {
        alert(error.message.slice(22, -2));
      }
    };
    const unReserveSlot = ()=>{
      try {
        // Find and update the slot in the local state
        const updatedSlots = slotData.map(slot => {
            if (slot.id === userData?.slotDetails?.slot) {
                if(userData?.slotDetails?.status == "RESERVED")
                {
                  var updatedSlot = { userID:"", isReserved: "UNRESERVED" };
                  // Update the value in Firebase Realtime Database
                  setSlotinUser(userData?.slotDetails?.slot, "UNRESERVED");
                  const RT = getDatabase();
                  const slotRef = ref(RT, `slots/${userData?.slotDetails?.slot}`);
                  update(slotRef, updatedSlot);
                  updatedSlot = {id:userData?.slotDetails?.slot,...updatedSlot}
                  // Return the updated slot
                  return updatedSlot;
              }else{
                alert("Click the slot to reserve")
              }
            }
            return slot;
        });
        setSlotData(updatedSlots);
    } catch (error) {
        console.error("Error updating slot:", error);
    }
    }
    // const addSlots =()=>{
    //   const rt = getDatabase();
    //   for(let i=3;i<=200;i++){
    //     set(ref(rt,'slots/s'+i),{
    //       isReserved:"UNRESERVED",
    //       userID:""
    //     })
    //   }
    // }
    // addSlots()
    const handleSlotClick = async (slotId) => {
      try {
          // Find and update the slot in the local state
          const updatedSlots = slotData.map(slot => {
              if (slot.id === slotId) {
                if(slot.isReserved=="RESERVED"){
                  alert("Slot is already reserved")
                }else{
                  if(userData?.slotDetails?.status == "UNRESERVED")
                  {
                    var updatedSlot = { userID:userData.RFID, isReserved: "RESERVED" };
                    // Update the value in Firebase Realtime Database
                    setSlotinUser(slotId, "RESERVED");
                    const RT = getDatabase();
                    const slotRef = ref(RT, `slots/${slotId}`);
                    update(slotRef, updatedSlot);
                    updatedSlot = {id:slotId,...updatedSlot}
                    // Return the updated slot
                    return updatedSlot;
                }else{
                  alert("you already reserved a slot unreserve that slot to reserve that.")
                }
              }
              }
              return slot;
          });
          setSlotData(updatedSlots);
      } catch (error) {
          console.error("Error updating slot:", error);
      }
  };
  
    const SlotElement = ({data}) =>(
      <div className={`w-20 bg-gradient-to-bl h-36 flex justify-center items-center rounded-lg from-green-400/90 flex-col to-transparent cursor-pointer ${data.isReserved=="RESERVED" && " from-red-500 cursor-no-drop"}` } onClick={()=>{handleSlotClick(data.id)}}>
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
    });
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
    console.log(userData);
    
    
  return (
    <div className='text-white flex justify-center items-center w-full flex-col py-20'>
      <Navigation setPage={setPage} loginButton={false}/>
      <section id='Slots booking' className='w-[90%] h-screen flex flex-col lg:flex-row gap-9'>
        <div className='h-full flex-1 backdrop-blur-lg bg-gradient-to-br to-cyan-600 from-orange-400 p-5 rounded-lg overflow-y-auto'>
          <h1>Slots</h1>
          <div className='w-full h-full flex flex-wrap gap-5 mt-10'>
  {
    slotData &&
    slotData
      .sort((a, b) => {
        // Extract numeric part from the slot IDs
        const numA = parseInt(a.id.match(/\d+/));
        const numB = parseInt(b.id.match(/\d+/));
        
        // If both slots have numbers, compare numerically
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        
        // If one of them doesn't have a numeric part, fallback to default comparison
        return a.id.localeCompare(b.id);
      })
      .map((data, index) => <SlotElement data={data} key={index} />)
  }
</div>

          
        </div>
        <div className='h-full flex-1 flex flex-col gap-10 '>
        <div className='flex-1 backdrop-blur-lg bg-gradient-to-r from-cyan-600/20 to-lime-300/20 p-5 rounded-lg shadow-md shadow-white'>
  <h1>Active Slots</h1>
  <div className='flex flex-col justify-center items-center'>
    <div
      onClick={() => unReserveSlot()}
      className={`${
        userData?.slotDetails?.status === "RESERVED" ? "border-green-200 bg-green-500" :
        userData?.slotDetails?.status === "OCCUPIED" ? "border-yellow-200 bg-yellow-500" :
        "border-red-200 bg-red-500"
      } border-black rounded-full border-4 w-40 h-40 flex justify-center items-center cursor-pointer`}
    >
      <h1 className='rounded-full'>{userData?.slotDetails?.status}</h1>
    </div>

    <h2>Reserved slot: <span className='text-2xl font-bold text-green-300'>{userData?.slotDetails?.slot}</span></h2>
    <table className='mt-5 w-full'>
      <thead>
        <tr className='border-b border-gray-300'>
          <th className='py-2'>Date</th>
          <th className='py-2'>Time</th>
          <th className='py-2'>Status</th>
        </tr>
      </thead> 
    </table>
    <div className='overflow-y-auto w-full h-60'>
      <table className='w-full'>
        <tbody>
          {userData?.slotDetails?.timeStamps.map((data, index) => {
            const date = new Date(data.ts);
            const formattedDate = date.toLocaleDateString();
            const formattedTime = date.toLocaleTimeString();

            return (
              <tr className='border-b border-gray-200' key={index}>
                <td className='py-2'>{formattedDate}</td>
                <td className='py-2'>{formattedTime}</td>
                <td className='py-2'>{data.status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
</div>

          <div className='flex-1 backdrop-blur-lg bg-gradient-to-r from-cyan-600/20 to-lime-300/10 p-5 rounded-lg flex flex-col shadow-md shadow-white'>
            <h1 className='text-3xl font-bold'>Profile Details</h1>
            <table className='min-w-full mt-5 h-full'>
    
                <tbody>
                <tr>
                        <td className='border-b border-gray-200 py-2'>Student Name</td>
                        <td className='border-b border-gray-200 py-2'>{userData?.studentName}</td>
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