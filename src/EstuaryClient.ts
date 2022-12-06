import axios from 'axios';
import { packToFs } from 'ipfs-car/pack/fs';
import { FsBlockStore } from 'ipfs-car/blockstore/fs';
import FormData from 'form-data';
import * as fs from 'fs';

export class Pin {
  status: string;
  created: string;
  delegates: string[];
  cid: string;
  name: string;
  constructor(status: string, created: string, delegates: string[], cid: string, name: string) {
    this.status = status;
    this.created = created;
    this.delegates = delegates;
    this.cid = cid;
    this.name = name;
  }
  deletePin() {
    return deletePin(this.cid);
  }
}
export type Key = {
  token: string,
  tokenHash: string,
  label: string,
  expiry: string,
};

export class EstuaryFile {
  cid: string;
  estuaryId: string;
  retrievalUrl: string;
  providers: string[];
  constructor(cid: string, estuaryId: string, retrievalUrl: string, providers: string[]) {
    this.cid = cid;
    this.estuaryId = estuaryId;
    this.retrievalUrl = retrievalUrl;
    this.providers = providers;
  }
  deletePin() {
    return deletePin(this.cid);
  }
}

export const getPins = async (apiKey?: string) => {
  const API_KEY = process.env.Estuary_API_KEY || apiKey;

  try {
    let res = await axios.get(`https://api.estuary.tech/pinning/pins`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });
    let pins: Pin[];
    pins = res.data.results.map((result: any) => {
      return new Pin(result.status, result.created, result.delegates, result.pin.cid, result.pin.name);
    });
    return pins;
  } catch (err) {
    console.log(`EstuaryJS(getPins): Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.response.data}`);
  }
};

export const getPin = async (cid: string, apiKey?: string) => {
  const API_KEY = process.env.Estuary_API_KEY || apiKey;
  try {
    let res = await axios.get(`https://api.estuary.tech/pinning/pins/${cid}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });
    return new Pin(res.data.status, res.data.created, res.data.delegates, res.data.pin.cid, res.data.pin.name);
  } catch (err) {
    console.log(`EstuaryJS(getPin): Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.response.data}`);
  }
};

export const addPin = async (cid: string, name?: string, apiKey?: string) => {
  const API_KEY = process.env.Estuary_API_KEY || apiKey;
  try {
    let res = await axios.post(
      `https://api.estuary.tech/pinning/pins`,
      {
        cid: cid,
        name: name ? name : cid,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
    return new Pin(res.data.status, res.data.created, res.data.delegates, res.data.pin.cid, res.data.pin.name);
  } catch (err) {
    console.log(`EstuaryJS(addPin): Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.response.data}`);
  }
};

export const deletePin = async (cid: string, apiKey?: string) => {
  const API_KEY = process.env.Estuary_API_KEY || apiKey;
  try {
    let res = await axios.delete(`https://api.estuary.tech/pinning/pins/${cid}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });
    return res;
  } catch (err) {
    console.log(`EstuaryJS(deletePin): Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.response.data}`);
  }
};

export const getKeys = async (apiKey?: string) => {
  const API_KEY = process.env.Estuary_API_KEY || apiKey;
  try {
    let res = await axios.get(`https://api.estuary.tech/user/api-keys`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });
    let keys: Key[] = res.data.results.map((result: any) => {
      return {
        token: result.token,
        tokenHash: result.tokenHash,
        label: result.label,
        expiry: result.expiry,
      };
    });
    return keys;
  } catch (err) {
    console.log(`EstuaryJS(getKeys): Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.response.data}`);
  }
};
export const createKey = async (expiry: string, apiKey?: string) => {
  const API_KEY = process.env.Estuary_API_KEY || apiKey;
  /*
            Create a new key
            Expiry:string - Expiration - Valid time units are ns, us (or µs), ms, s, m, h. for example 300h
            */
  try {
    let res = await axios.post(
      `https://api.estuary.tech/user/api-keys`,
      {
        expiry: expiry,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
    return {
      token: res.data.token,
      tokenHash: res.data.tokenHash,
      label: res.data.label,
      expiry: res.data.expiry,
    };
  } catch (err) {
    console.log(`EstuaryJS(createKey): Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.response.data}`);
  }
};
export const deleteKey = async (key: string, apiKey?: string) => {
  const API_KEY = process.env.Estuary_API_KEY || apiKey;
  try {
    let res = await axios.delete(`https://api.estuary.tech/user/api-keys/${key}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });
    return res;
  } catch (err) {
    console.log(`EstuaryJS(deleteKey) Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.response.data}`);
  }
};

export const addFile = async (file: any, apiKey?: string): Promise<EstuaryFile> => {
  const API_KEY = process.env.Estuary_API_KEY || apiKey;
  const formData = new FormData();
  formData.append('data', file);

  try {
    console.log('Uploading file to Estuary...')
    let res = await axios.post(`https://upload.estuary.tech/content/add`, formData, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    console.log('File Uploaded at https://gateway.estuary.tech/gw/ipfs/' + res.data.cid);
    return new EstuaryFile(res.data.cid, res.data.estuaryId, 'https://gateway.estuary.tech/gw/ipfs/' + res.data.cid, res.data.providers);
  } catch (err) {
    console.log(`EstuaryJS: addFile Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.response.data}`);
    return err;
  }
};

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
export const addFiles = async (directory: string, name: string, apiKey?: string): Promise<EstuaryFile> => {
  const API_KEY = process.env.Estuary_API_KEY || apiKey;
  console.log('Creating CAR file...');
  let { root, filename } = await packToFs({
    input: `${directory}`,
    output: `${directory}/${name}.car`,
    wrapWithDirectory: false,
    blockstore: new FsBlockStore(),
  });
  let path = `${directory}/${name}.car`;
  while (!fs.existsSync(path)) {
    sleep(200);
  }
  await sleep(1000);
  let fileData = fs.readFileSync(path);
  console.log('Uploading to Estuary...');
  try {
    let res = await axios.post(`https://upload.estuary.tech/content/add-car`, fileData, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    console.log('Cleaning up...')
    fs.unlinkSync(path);
    console.log('File Uploaded at https://gateway.estuary.tech/gw/ipfs/' + res.data.cid);
    return new EstuaryFile(res.data.cid, res.data.estuaryId, 'https://gateway.estuary.tech/gw/ipfs/' + res.data.cid, res.data.providers);
  } catch (err) {
    console.log(err.response.data);
    console.log(`EstuaryJS(addFiles): Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.response.data}`);
    return err;
  }
};

export default {
  getPins,
  getPin,
  addPin,
  deletePin,
  getKeys,
  createKey,
  deleteKey,
  addFile,
  addFiles,
};
