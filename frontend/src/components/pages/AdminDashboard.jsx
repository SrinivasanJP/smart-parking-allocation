import { getDatabase, onValue, ref } from 'firebase/database';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { pieArcLabelClasses, PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts';
import AdminSlots from './AdminSlots';
import AdminUsers from './AdminUsers';

const AdminDashboard = () => {
  const [tab, setTab] = useState("s");
  const [slotData, setSlotData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [countOfSlots, setCountOfSlots] = useState([]);
  const [lineChartData, setLineChartData] = useState({ timestamps: [], reservedCounts: [] });

  useEffect(() => {
    const RT = getDatabase();
    const RTref = ref(RT, 'slots');
    onValue(RTref, (snapshot) => {
      if (snapshot.exists()) {
        const dataArray = Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }));
        setSlotData(dataArray);
      } else {
        console.log('No Data available');
      }
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'user'));
        const fetchedUserData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUserData(fetchedUserData);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);
  const currentTS = Date.now();
  useEffect(() => {
    const updateSlotCount = () => {
      const reserved = slotData.filter((data) => data.isReserved === "RESERVED").length;
      const unreserved = slotData.filter((data) => data.isReserved === "UNRESERVED").length;
      const occupied = slotData.filter((data) => data.isReserved === "OCCUPIED").length;

      setCountOfSlots([
        { id: 0, value: reserved, label: "RESERVED", color: "#00ff00" },
        { id: 1, value: unreserved, label: "UNRESERVED", color: "#fa001f" },
        { id: 2, value: occupied, label: "OCCUPIED", color: "#ffaa00" },
      ]);
      setLineChartData((prev) => ({
        timestamps: [...prev.timestamps, currentTS],
        reservedCounts: [...prev.reservedCounts,reserved],
      }));
    }
    updateSlotCount();
  }, [slotData]);
  return (
    <div>
      <div className="bg-cyan-200 py-3 px-10">
        <h1 className="text-2xl font-bold text-blue-950">Smart Parking Admin Dashboard</h1>
      </div>
      <div className=' flex justify-center flex-col items-center gap-10 my-10'>
        <h1 className=' text-2xl font-bold'>User Slot reservation Monitor</h1>
        {lineChartData.timestamps.length > 0 && (
          <LineChart
          xAxis={[{
            data: lineChartData.timestamps,
            label: "Time",
            valueFormatter: (value) => new Date(value).toLocaleTimeString(),
          }]}
            series={[
              {
                data:  lineChartData.reservedCounts,
                label: "Reserved Slots Over Time",
                color: "#00f",
              },
            ]}
            width={1250}
            height={400}
            sx={{
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              padding: "10px",
            }}
          />
        )}
      </div>
      <div className="flex justify-evenly mt-20 flex-wrap gap-10 ">
        <div className="flex flex-col justify-center items-center gap-10">
          <h1 className="text-3xl font-semibold">Slots Details</h1>
          <PieChart
            series={[
              {
                data: countOfSlots,
                innerRadius: 30,
                outerRadius: 150,
                paddingAngle: 5,
                cornerRadius: 5,
                startAngle: 0,
                endAngle: 340,
                cx: 150,
                arcLabel: (item) => `${item.label}`,
                arcLabelMinAngle: 20,
                highlightScope: { fade: 'global', highlight: 'item' },
                faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
              },
            ]}
            sx={{
              [`& .${pieArcLabelClasses.root}`]: {
                fontWeight: 'bold',
                color: "#ffffff",
              },
            }}
            width={500}
            height={400}
          />
        </div>
        <div className="flex flex-col justify-center items-center gap-10">
          <h1 className="text-3xl font-semibold">User-Slot Details</h1>
          <PieChart
            series={[
              {
                data: [
                  { id: 0, value: userData.length, label: "Users" },
                  { id: 1, value: slotData.length, label: "Slots" },
                ],
                innerRadius: 30,
                outerRadius: 150,
                paddingAngle: 5,
                cornerRadius: 5,
                startAngle: 0,
                endAngle: 340,
                cx: 150,
                arcLabel: (item) => `${item.label}`,
                highlightScope: { fade: 'global', highlight: 'item' },
                faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
              },
            ]}
            sx={{
              [`& .${pieArcLabelClasses.root}`]: {
                fontWeight: 'bold',
                color: "#ffffff",
              },
            }}
            width={500}
            height={400}
          />
        </div>
      </div>

      <div className=' flex justify-evenly'>
        <h1 onClick={()=>{setTab("s")}} className={`${tab=='s'?" border-cyan-500 text-xl bg-cyan-300/10":""} border-b-2 w-full text-center transition-all duration-200 py-4 cursor-pointer`}>Slot Detials</h1>
        <h2 onClick={()=>{setTab("u")}} className={`${tab=='u'?" border-cyan-500 text-xl bg-cyan-300/10":""} border-b-2 w-full text-center transition-all duration-200 py-4 cursor-pointer`}>User Details</h2>            
      </div>
      <div className='w-full'>
      {
        tab=="s"?<AdminSlots slotData={slotData} userData={userData}/>:<AdminUsers userData={userData}/>
      }
      </div>
      


      
    </div>
  );
};

export default AdminDashboard;
