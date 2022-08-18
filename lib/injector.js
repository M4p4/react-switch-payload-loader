const intermezzo = new Uint8Array([
  0x44, 0x00, 0x9f, 0xe5, 0x01, 0x11, 0xa0, 0xe3, 0x40, 0x20, 0x9f, 0xe5, 0x00,
  0x20, 0x42, 0xe0, 0x08, 0x00, 0x00, 0xeb, 0x01, 0x01, 0xa0, 0xe3, 0x10, 0xff,
  0x2f, 0xe1, 0x00, 0x00, 0xa0, 0xe1, 0x2c, 0x00, 0x9f, 0xe5, 0x2c, 0x10, 0x9f,
  0xe5, 0x02, 0x28, 0xa0, 0xe3, 0x01, 0x00, 0x00, 0xeb, 0x20, 0x00, 0x9f, 0xe5,
  0x10, 0xff, 0x2f, 0xe1, 0x04, 0x30, 0x90, 0xe4, 0x04, 0x30, 0x81, 0xe4, 0x04,
  0x20, 0x52, 0xe2, 0xfb, 0xff, 0xff, 0x1a, 0x1e, 0xff, 0x2f, 0xe1, 0x20, 0xf0,
  0x01, 0x40, 0x5c, 0xf0, 0x01, 0x40, 0x00, 0x00, 0x02, 0x40, 0x00, 0x00, 0x01,
  0x40,
]);

const RCM_PAYLOAD_ADDRESS = 0x40010000;
const INTERMEZZO_LOCATION = 0x4001f000;

export const createRCMPayload = (payload) => {
  const rcmLength = 0x30298;

  const intermezzoAddressRepeatCount =
    (INTERMEZZO_LOCATION - RCM_PAYLOAD_ADDRESS) / 4;

  const rcmPayloadSize =
    Math.ceil(
      (0x2a8 +
        0x4 * intermezzoAddressRepeatCount +
        0x1000 +
        payload.byteLength) /
        0x1000
    ) * 0x1000;

  const rcmPayload = new Uint8Array(new ArrayBuffer(rcmPayloadSize));
  const rcmPayloadView = new DataView(rcmPayload.buffer);
  rcmPayloadView.setUint32(0x0, rcmLength, true);
  for (let i = 0; i < intermezzoAddressRepeatCount; i++) {
    rcmPayloadView.setUint32(0x2a8 + i * 4, INTERMEZZO_LOCATION, true);
  }
  rcmPayload.set(intermezzo, 0x2a8 + 0x4 * intermezzoAddressRepeatCount);
  rcmPayload.set(payload, 0x2a8 + 0x4 * intermezzoAddressRepeatCount + 0x1000);
  return rcmPayload;
};

export const bufferToHex = (data) => {
  let result = '';
  for (let i = 0; i < data.byteLength; i++)
    result += data.getUint8(i).toString(16).padStart(2, '0');
  return result;
};

export const write = async (device, data) => {
  let length = data.length;
  let writeCount = 0;
  const packetSize = 0x1000;

  while (length) {
    const dataToTransmit = Math.min(length, packetSize);
    length -= dataToTransmit;

    const chunk = data.slice(0, dataToTransmit);
    data = data.slice(dataToTransmit);
    await device.transferOut(1, chunk);
    writeCount++;
  }
  return writeCount;
};

export const readFileAsArrayBuffer = (file) => {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      res(e.target.result);
    };
    reader.readAsArrayBuffer(file);
  });
};
