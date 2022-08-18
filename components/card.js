import React from 'react';

const Card = (props) => {
  return (
    <div className="bg-slate-800 max-w-md mx-auto p-4 mt-10 rounded-lg shadow-lg text-white text-center border border-slate-700">
      {props.children}
    </div>
  );
};

export default Card;
