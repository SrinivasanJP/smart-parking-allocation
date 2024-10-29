import { LineChart } from '@mui/x-charts';
import React, { useState } from 'react'

const AdminUsers = ({userData}) => {
  const [tab, setTab] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const handleSlotClick = (index) => {
        if (selectedId === index) {
            setTab(false);
            setSelectedId(null);
        } else {
            setSelectedId(index);
            setTab(true);
        }
    };
  return (
    <div className=' flex justify-center p-10 gap-10'>
      <table className='w-full h-fit'>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>RFID</th>
          </tr>
        </thead>
      <tbody>
      {
        userData.map((data,index)=>(
          <tr key={index} onClick={()=>{handleSlotClick(index)}}>
            <td className='text-center'>{index+1}</td>
            <td className='text-center'>{data.studentName}</td>
            <td className='text-center'>{data.RFID}</td>
          </tr>
        ))
      }
      </tbody>
      </table>
      <div className={`transition-all duration-700 ease-in-out bg-cyan-400/10 p-10 rounded-xl h-fit ${tab ? 'min-w-[50%] relative translate-x-0' : 'absolute translate-x-[50em] right-[5em]'}`}>

          <div>
            <h1 className="text-2xl font-bold">User Basic Detials</h1>
             <table className="min-w-full mt-5 h-full">
    <tbody>
      <tr>
        <td className="border-b border-gray-200 py-4 text-xl">User Name</td>
        <td className="border-b border-gray-200 py-4 text-xl">{userData[selectedId]?.studentName}</td>
      </tr>
      <tr>
        <td className="border-b border-gray-200 py-4 text-xl">RFID</td>
        <td className="border-b border-gray-200 py-4 text-xl">{userData[selectedId]?.RFID}</td>
      </tr>
      <tr>
        <td className="border-b border-gray-200 py-4 text-xl">Email</td>
        <td className="border-b border-gray-200 py-4 text-xl">{userData[selectedId]?.email}</td>
      </tr>
      <tr>
        <td className="border-b border-gray-200 py-4 text-xl">Address</td>
        <td className="border-b border-gray-200 py-4 text-xl">{userData[selectedId]?.address}</td>
      </tr>
      <tr>
        <td className="border-b border-gray-200 py-4 text-xl">Date of Birth</td>
        <td className="border-b border-gray-200 py-4 text-xl">{userData[selectedId]?.dob}</td>
      </tr>

      <tr>
        <td className="border-b border-gray-200 py-4 text-xl">Gender</td>
        <td className="border-b border-gray-200 py-4 text-xl">{userData[selectedId]?.gender}</td>
      </tr>
      <tr>
        <td className="border-b border-gray-200 py-4 text-xl">Phone Number</td>
        <td className="border-b border-gray-200 py-4 text-xl">{userData[selectedId]?.phoneNumber}</td>
      </tr>
    </tbody>
  </table>
      <h1 className='text-2xl font-bold mt-10'>User Reservation History</h1>
    <table className="mt-5 w-full">
      <thead>
        <tr className="border-b border-gray-300">
          <th className="py-2">Date</th>
          <th className="py-2">Time</th>
          <th className="py-2">Status</th>
        </tr>
      </thead>
    </table>
    <div className="overflow-y-auto w-full h-[30em]">
      <table className="w-full">
        <tbody>
          {userData[selectedId]?.slotDetails?.timeStamps.map((data, index) => {
            const date = new Date(data.ts);
            const formattedDate = date.toLocaleDateString();
            const formattedTime = date.toLocaleTimeString();

            return (
              <tr className="border-b border-gray-200" key={index}>
                <td className="py-2">{formattedDate}</td>
                <td className="py-2">{formattedTime}</td>
                <td className="py-2">{data.status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  <div className='mt-10'>
        <h1 className='text-2xl font-bold'>User Reservation plot:</h1>
        {console.log(userData[selectedId]?.slotDetails?.timeStamps)}
        <LineChart
          width={600}
          height={400}
          xAxis={[{
            dataKey: "ts",
            type: 'time',
            label: 'Timestamp',
            tickFormat: (value) => new Date(value).toLocaleTimeString(),
          }]}
          series={[{
            dataKey: "statusValue",
            label: "Status (2 = Reserved, 1 = Unreserved, 0 = Occupaid)",
          }]}
          dataset={userData[selectedId]?.slotDetails?.timeStamps.map((data) => ({
            ts: data.ts,
            statusValue: data.status === 'RESERVED' ? 2 : data.status ==='UNRESERVED'?1:0 // Map status to 1 or 0
          })) || []}
        />
      </div>
          </div>
      </div>
      
      
    </div>
  )
}

export default AdminUsers