import React from 'react';
import Navigation from '../Navigation';
import bg_main from "http://localhost:5173/bg_main.jpg";

const Home = ({ setPage }) => {
  console.log(bg_main);
  
  return (
    <div
      id="home"
      className="mt-[66px] bg-[url('../../assets/bg_main.jpg')]"
    >
      <Navigation setPage={setPage} />
    </div>
  );
};

export default Home;
