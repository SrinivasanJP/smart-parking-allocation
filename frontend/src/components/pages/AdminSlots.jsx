import React, { useState } from 'react';
import SlotElement from '../SlotElement';
import { LineChart } from '@mui/x-charts';

const AdminSlots = ({ slotData, userData }) => {
    const [tab, setTab] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [prevSelectedId, setPrevSelectedId] = useState(null);

    const handleSlotClick = (index) => {
        if (selectedId === index) {
            // If clicking the same slot twice, close the tab and reset prevSelectedId
            setTab(false);
            setPrevSelectedId(null);
            setSelectedId(null);
        } else {
            // If selecting a new slot, update prevSelectedId and selectedId, and open the tab
            setPrevSelectedId(selectedId);
            setSelectedId(index);
            setTab(true);
        }
    };

    return (
        <div className='p-10 flex w-full'>
            <div className='flex flex-wrap gap-11 justify-center items-center w-full'>
                {slotData &&
                    slotData
                        .sort((a, b) => {
                            const numA = parseInt(a.id.match(/\d+/));
                            const numB = parseInt(b.id.match(/\d+/));

                            if (!isNaN(numA) && !isNaN(numB)) {
                                return numA - numB;
                            }

                            return a.id.localeCompare(b.id);
                        })
                        .map((data, index) => (
                            <SlotElement
                                handleSlotClick={() => handleSlotClick(index)}
                                data={data}
                                key={index}
                            />
                        ))}
            </div>
            <div className={`transition-all duration-700 ease-in-out bg-cyan-400/10 p-10 rounded-xl ${tab ? 'min-w-[50%] translate-x-0' : 'w-0 translate-x-[50em]'}`}>
                <h1 className='text-2xl font-bold mb-10'>Slot Details</h1>
                <table className=' w-full'>
                    <thead>
                        <tr>
                            <th>Fields</th>
                            <th>Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedId != null &&
                            Object.keys(slotData[selectedId]).map((field, index) => (
                                <tr key={index}>
                                    <td>{field}</td>
                                    <td>{slotData[selectedId][field]}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
                {slotData[selectedId]?.userID ? <div className='mt-10 '>
                  <h1 className='text-2xl font-bold'>Reserved User data:</h1>
                  {userData.filter(data => data.RFID === slotData[selectedId]?.userID).map((data,index)=>(
                    <div key={index}>
                       <table className="min-w-full mt-5 h-full">
              <tbody>
                <tr>
                  <td className="border-b border-gray-200 py-2">Student Name</td>
                  <td className="border-b border-gray-200 py-2">{data?.studentName}</td>
                </tr>
                <tr>
                  <td className="border-b border-gray-200 py-2">RFID</td>
                  <td className="border-b border-gray-200 py-2">{data.RFID}</td>
                </tr>
                <tr>
                  <td className="border-b border-gray-200 py-2">Email</td>
                  <td className="border-b border-gray-200 py-2">{data.email}</td>
                </tr>
                <tr>
                  <td className="border-b border-gray-200 py-2">Address</td>
                  <td className="border-b border-gray-200 py-2">{data.address}</td>
                </tr>
                <tr>
                  <td className="border-b border-gray-200 py-2">Date of Birth</td>
                  <td className="border-b border-gray-200 py-2">{data.dob}</td>
                </tr>

                <tr>
                  <td className="border-b border-gray-200 py-2">Gender</td>
                  <td className="border-b border-gray-200 py-2">{data.gender}</td>
                </tr>
                <tr>
                  <td className="border-b border-gray-200 py-2">Phone Number</td>
                  <td className="border-b border-gray-200 py-2">{data.phoneNumber}</td>
                </tr>
              </tbody>
            </table>
            <div className='mt-10'>
                  <h1 className='text-2xl font-bold'>User Reservation plot:</h1>
                  {console.log(data.slotDetails.timeStamps)}
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
                    dataset={data.slotDetails.timeStamps.map((data) => ({
                      ts: data.ts,
                      statusValue: data.status === 'RESERVED' ? 2 : data.status ==='UNRESERVED'?1:0 // Map status to 1 or 0
                    })) || []}
                  />
                </div>
                    </div>
                    
                  ))
                  
                  }

                </div>: <h1 className='mt-20 w-full text-center'>
                  No User Reserved 
                </h1>
                }
            </div>
        </div>
    );
};

export default AdminSlots;
