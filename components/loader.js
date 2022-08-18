import React from 'react';
import Card from './card';

const Loader = () => {
  return (
    <Card>
      <h1 className="text-2xl mb-5 font-semibold border-b-2 border-b-gray-700 border-">
        Switch Payload Loader
      </h1>
      <h3 className="mt-5 mb-1 text-md font-medium text-gray-200">
        Select Payload
      </h3>

      <div className="mx-auto p-3 md:ml-24 text-sm text-gray-200">
        <input type={'file'} />
      </div>

      <button className="bg-sky-700 w-full p-4 rounded-md hover:bg-sky-600 border border-sky-800 duration-200 shadow-lg">
        Inject Payload
      </button>
      <h3 className="mt-5 mb-2 text-md font-medium text-gray-200">Log</h3>
      <textarea
        rows={10}
        cols={5}
        readOnly
        style={{ resize: 'none' }}
        className="bg-slate-600 border border-slate-700 w-full rounded-md focus:outline-none p-4"
        placeholder="Select a payload and inject to your console"
      ></textarea>
    </Card>
  );
};

export default Loader;
