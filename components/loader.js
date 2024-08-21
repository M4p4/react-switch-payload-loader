import Image from 'next/image';
import React, { useState, useReducer } from 'react';
import {
  write,
  createRCMPayload,
  readFileAsArrayBuffer,
  bufferToHex,
} from '../lib/injector';
import { loaderReducer, INIT_STATUS_STATE } from '../reducers/statusReducer';
import Card from './card';

const Loader = () => {
  const [file, setFile] = useState(null);
  const [log, setLog] = useState('');
  const [state, dispatch] = useReducer(loaderReducer, INIT_STATUS_STATE);
  const { error, loading } = state;

  const updateLog = (line) => {
    console.log(line);
    setLog((current) => current + line + '\n');
  };

  const selectFile = (e) => {
    dispatch({ type: 'FINISH' });
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      dispatch({ type: 'ERROR', payload: 'Select a payload file.' });
      return;
    }

    if (
      selectedFile.type === 'application/macbinary' ||
      selectedFile.type === 'application/octet-stream'
    ) {
      setFile(selectedFile);
    } else {
      dispatch({ type: 'ERROR', payload: 'Invalid file type.' });
    }
  };

  const injectPayload = async () => {
    //empty log and reset error  on each injection
    setLog('');
    dispatch({ type: 'LOADING' });

    if (!file) {
      dispatch({ type: 'ERROR', payload: 'Select a payload file.' });
      return;
    }

    let device;

    try {
      device = await navigator.usb.requestDevice({
        filters: [{ vendorId: 0x0955 }],
      });
    } catch (error) {
      dispatch({
        type: 'ERROR',
        payload: 'Connect your Nintendo Switch in RCM mode.',
      });
      return;
    }

    const payload = new Uint8Array(await readFileAsArrayBuffer(file));

    try {
      await device.open();
      updateLog(
        `Connected to ${device.manufacturerName} ${device.productName}`
      );
      await device.claimInterface(0);
      const deviceID = await device.transferIn(1, 16);
      updateLog(`Device ID: ${bufferToHex(deviceID.data)}`);

      const rcmPayload = createRCMPayload(payload);
      updateLog('Sending payload...');
      const writeCount = await write(device, rcmPayload);
      updateLog('Payload sent!');

      if (writeCount % 2 !== 1) {
        updateLog('Switching to higher buffer...');
        await device.transferOut(1, new ArrayBuffer(0x1000));
      }
    } catch (error) {
      dispatch({ type: 'ERROR', payload: 'Failed to inject payload!' });
      return;
    }

    updateLog('Trigging vulnerability...');
    dispatch({ type: 'FINISH' });
    try {
      const vulnerabilityLength = 0x7000;
      await device.controlTransferIn(
        {
          requestType: 'standard',
          recipient: 'interface',
          request: 0x00,
          value: 0x00,
          index: 0x00,
        },
        vulnerabilityLength
      );
    } catch (error) {
      return;
    }
  };

  return (
    <Card>
      <h1 className="text-3xl mb-5 font-semibold border-b-2 border-b-gray-700 border-">
        Switch Payload Loader
      </h1>
      <h3 className="mt-5 mb-1 text-md font-medium text-gray-200">
        Select Payload
      </h3>

      <div className="mx-auto p-3 ml-24 text-sm text-gray-200">
        <input
          type={'file'}
          onChange={selectFile}
          accept="application/macbinary, application/octet-stream"
        />
      </div>

      <button
        onClick={injectPayload}
        className="bg-sky-700 w-full p-4 rounded-md hover:bg-sky-600 border border-sky-800 duration-200 shadow-lg"
      >
        {loading ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="mx-auto w-6 animate-spin"
            src="/images/loading.svg"
            alt="Loading..."
          />
        ) : (
          'Inject Payload'
        )}
      </button>

      {error && (
        <p className="p-2 text-sm text-gray-200 border border-red-600 bg-red-700 rounded-md mt-4">
          <span className="font-bold">Error: </span>
          {error}
        </p>
      )}

      <h3 className="mt-5 mb-2 text-md font-medium text-gray-200">Log</h3>
      <textarea
        rows={10}
        cols={5}
        readOnly
        value={log}
        style={{ resize: 'none' }}
        className="bg-slate-600 border border-slate-700 w-full rounded-md focus:outline-none p-4"
        placeholder="Select a payload and inject to your console"
      ></textarea>
    </Card>
  );
};

export default Loader;
