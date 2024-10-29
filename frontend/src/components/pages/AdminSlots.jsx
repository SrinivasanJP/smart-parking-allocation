import React, { useState } from 'react'
import SlotElement from '../SlotElement';

const AdminSlots = ({slotData, userData}) => {
    const [tab,setTab] = useState(true);
  return (
    <div className='p-10 flex w-full'>
        <div className='flex flex-wrap gap-11 justify-center items-center w-full'>
        {slotData &&
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
                .map((data, index) => <SlotElement handleSlotClick={()=>{setTab(!tab)}} data={data} key={index} />)}
        </div>
        <div className={`transition-all duration-700 ease-in-out bg-cyan-400/10 p-10 rounded-xl ${tab? 'min-w-[50%] translate-x-0' : 'w-0 translate-x-[50em]'}`}>
            <h1>Slot Detials</h1>

        </div>
       
                
    </div>
  )
}

export default AdminSlots