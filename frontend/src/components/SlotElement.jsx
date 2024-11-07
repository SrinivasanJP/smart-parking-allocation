import React from 'react'

const SlotElement = ({ data, handleSlotClick }) => (
    <div
      className={`w-28 bg-gradient-to-bl h-36 flex justify-center items-center rounded-lg from-green-400/90 flex-col to-transparent cursor-pointer ${data.isReserved == 'RESERVED' && ' from-red-500 cursor-no-drop'}`}
      onClick={() => {
        handleSlotClick(data.id);
      }}
    >
      <h1>{data.id.toUpperCase()}</h1>
      {<p>{data.isReserved}</p>}
    </div>
  );
export default SlotElement