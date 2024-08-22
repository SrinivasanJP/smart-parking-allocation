import React from 'react';
import Navigation from '../Navigation';
import BGImg from "../../assets/bg_main.jpg"

const Home = ({ setPage }) => {
  
  return (
    <div
      id="home"
      className="mt-[66px] w-screen h-screen"
    >
      <img src={BGImg} alt="bg  image" className=' top-0 right-0 h-screen fixed' />
      <Navigation setPage={setPage} />
      <p>
        
      </p>
    </div>
  );
};

export default Home;
