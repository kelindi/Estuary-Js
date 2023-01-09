import axios from "axios";
import FormData from "form-data";

export class EstuaryFile {
  cid: string;
  estuaryId: string;
  retrievalUrl: string;
  providers: string[];
  constructor(
    cid: string,
    estuaryId: string,
    retrievalUrl: string,
    providers: string[]
  ) {
    this.cid = cid;
    this.estuaryId = estuaryId;
    this.retrievalUrl = retrievalUrl;
    this.providers = providers;
  }
  deletePin() {
    return deletePin(this.cid);
  }
}

export class Pin {
  status: string;
  created: string;
  delegates: string[];
  cid: string;
  name: string;
  constructor(
    status: string,
    created: string,
    delegates: string[],
    cid: string,
    name: string
  ) {
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
  token: string;
  tokenHash: string;
  label: string;
  expiry: string;
};

export const getPins = async (apiKey?: string): Promise<Pin[]> => {
  const API_KEY = apiKey;

  try {
    let res = await axios.get(`https://api.estuary.tech/pinning/pins`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });
    let pins: Pin[];
    pins = res.data.results.map((result: any) => {
      return new Pin(
        result.status,
        result.created,
        result.delegates,
        result.pin.cid,
        result.pin.name
      );
    });
    return pins;
  } catch (err) {
    console.log(
      `EstuaryJS(getPins): Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.response.data}`
    );
  }
};

export const getPin = async (cid: string, apiKey?: string): Promise<Pin> => {
  const API_KEY = apiKey;
  try {
    let res = await axios.get(`https://api.estuary.tech/pinning/pins/${cid}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });
    return new Pin(
      res.data.status,
      res.data.created,
      res.data.delegates,
      res.data.pin.cid,
      res.data.pin.name
    );
  } catch (err) {
    console.log(
      `EstuaryJS(getPin): Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.response.data}`
    );
  }
};

export const addPin = async (
  cid: string,
  name?: string,
  apiKey?: string
): Promise<Pin> => {
  const API_KEY = apiKey;
  try {
    let res = await axios.post(
      `https://api.estuary.tech/pinning/pins`,
      {
        cid: cid,
        name: name ?? cid,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
    return new Pin(
      res.data.status,
      res.data.created,
      res.data.delegates,
      res.data.pin.cid,
      res.data.pin.name
    );
  } catch (err) {
    console.log(
      `EstuaryJS(addPin): Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.response.data}`
    );
  }
};

export const deletePin = async (cid: string, apiKey?: string) => {
  const API_KEY = apiKey;
  try {
    let res = await axios.delete(
      `https://api.estuary.tech/pinning/pins/${cid}`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
    return res;
  } catch (err) {
    console.log(
      `EstuaryJS(deletePin): Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.response.data}`
    );
  }
};

export const getKeys = async (apiKey?: string):Promise<Key[]> => {
  const API_KEY = apiKey;
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
    console.log(
      `EstuaryJS(getKeys): Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.response.data}`
    );
  }
};

export const createKey = async (expiry: string, apiKey?: string):Promise<Key> => {
  const API_KEY = apiKey;
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
    console.log(
      `EstuaryJS(createKey): Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.response.data}`
    );
  }
};

export const deleteKey = async (key: string, apiKey?: string) => {
  const API_KEY = apiKey;
  try {
    let res = await axios.delete(
      `https://api.estuary.tech/user/api-keys/${key}`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
    return res;
  } catch (err) {
    console.log(
      `EstuaryJS(deleteKey) Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.response.data}`
    );
  }
};


export const putFile = async (file: any, apiKey?: string): Promise<EstuaryFile> => {
  const API_KEY = apiKey;
  const formData = new FormData();
  formData.append("data", file);
  try {
    console.log("Uploading file to Estuary...");
    let res = await axios.post(
      `https://upload.estuary.tech/content/add`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          ...formData.getHeaders ? formData.getHeaders() : { 'Content-Type': 'multipart/form-data' },
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );
    console.log(res);
    console.log(
      "File Uploaded at https://gateway.estuary.tech/gw/ipfs/" + res.data.cid
    );
    return new EstuaryFile(
      res.data.cid,
      res.data.estuaryId,
      "https://gateway.estuary.tech/gw/ipfs/" + res.data.cid,
      res.data.providers
    );
  } catch (err) {
    console.log(err);
    console.log(
      `EstuaryJS: addFile Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.response.data}`
    );
    return err;
  }
};

export const getFiles = async (apiKey?: string, limit?: string, offset?: string) => {
  const API_KEY = apiKey;
  try {
    let res = await axios.get(`https://api.estuary.tech/content/stats`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      params: {
        limit: limit,
        offset: offset,
      },
    });
    return res.data;
  } catch (err) {
    console.log(
      `EstuaryJS(getFiles): Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.response.data}`
    );
  }
};

