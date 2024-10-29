import { getDatabase, onValue, ref } from 'firebase/database';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { PieChart } from '@mui/x-charts/PieChart';

const AdminDashboard = () => {
  const [slotData, setSlotData] = useState();
  const [userData, setUserData] = useState();
  useEffect(() => {
    const RT = getDatabase();
    const RTref = ref(RT, 'slots');
    onValue(RTref, (snapshot) => {
      if (snapshot.exists()) {
        var dataArray = [];
        for (var i in snapshot.val()) dataArray.push({ id: i, ...snapshot.val()[i] });
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
        var userData = [];
        querySnapshot.forEach((doc) => {
          console.log(doc.id, ' => ', doc.data());
          userData.push(doc.data());
        });
        setUserData(userData);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);
  console.log(slotData);
  console.log(userData);

  return (
    <div>
      <div className="bg-cyan-200 py-3 px-10">
        <h1 className="text-2xl text-pretty  font-bold  text-blue-950">Admin Dashboard</h1>
      </div>
      <div>
        <PieChart
          series={[
            {
              data: [
                { id: 0, value: 10, label: 'series A' },
                { id: 1, value: 15, label: 'series B' },
                { id: 2, value: 20, label: 'series C' }
              ]
            }
          ]}
          width={400}
          height={200}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
