import React, { useState } from 'react';
import {
  write,
  createRCMPayload,
  readFileAsArrayBuffer,
  bufferToHex,
} from '../lib/injector';
import Card from './card';

const Loader = () => {
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [log, setLog] = useState('');

  const updateLog = (line) => {
    console.log(line);
    setLog((current) => current + line + '\n');
  };

  const selectFile = (e) => {
    setError('');
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      setError('Select a payload file.');
    }

    if (selectedFile.type === 'application/macbinary') {
      setFile(selectedFile);
    } else {
      setError('Invalid file type.');
    }
  };

  const injectPayload = async () => {
    //empty log and reset error  on each injection
    setLog('');
    setError('');

    if (!file) {
      setError('Select a payload file.');
      return;
    }

    let device;

    try {
      device = await navigator.usb.requestDevice({
        filters: [{ vendorId: 0x0955 }],
      });
    } catch (error) {
      setError('Connect your Nintendo Switch in RCM mode.');
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
      setError('Failed to inject payload!');
      return;
    }

    updateLog('Trigging vulnerability...');
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
        <input type={'file'} onChange={selectFile} />
      </div>

      <button
        onClick={injectPayload}
        className="bg-sky-700 w-full p-4 rounded-md hover:bg-sky-600 border border-sky-800 duration-200 shadow-lg"
      >
        Inject Payload
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
