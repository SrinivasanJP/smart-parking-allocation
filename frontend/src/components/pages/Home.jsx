import React from 'react';
import Navigation from '../Navigation';
import BGImg from '../../assets/bg_main.jpg';

const Home = ({ setPage }) => {
  return (
    <div
      id="home"
      className="w-screen h-screen flex justify-center items-start flex-col text-white"
    >
      <img src={BGImg} alt="bg  image" className="h-screen -z-10 absolute w-screen" />
      <Navigation setPage={setPage} />
      <p className=" w-3/4 bg-blue-400 py-10 px-10 rounded-r-2xl bg-gradient-to-tr from-[#8c00f2] to-[#00dfff] backdrop-blur-xl font-bold text-xl ">
        Smart parking allocation is a system designed to optimize parking space utilization by
        leveraging ESP32 microcontrollers. These microcontrollers serve as sensor nodes, detecting
        whether parking spots are occupied or vacant. Real-time data is collected and processed,
        allowing users to access parking availability information via mobile apps. By efficiently
        allocating available spots, smart parking systems reduce congestion, enhance user
        experiences, and contribute to a positive environmental impact.
      </p>
    </div>
  );
};

export default Home;
