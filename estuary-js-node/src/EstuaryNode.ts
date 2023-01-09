import axios from "axios";

import { packToFs } from "ipfs-car/pack/fs";

import { FsBlockStore } from "ipfs-car/blockstore/fs";
import * as fs from "fs";
import { deletePin, EstuaryFile } from "../browser/EstuaryBrowser.js";

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const putFiles = async (
  directory: string,
  name: string,
  apiKey?: string
): Promise<EstuaryFile> => {
  const API_KEY = process.env.Estuary_API_KEY || apiKey;
  console.log("Creating CAR file...");
  let { root, filename } = await packToFs({
    input: `${directory}`,
    output: `${directory}/${name}.car`,
    wrapWithDirectory: false,
    //@ts-ignore
    blockstore: new FsBlockStore(),
  });
  let path = `${directory}/${name}.car`;
  while (!fs.existsSync(path)) {
    sleep(200);
  }
  await sleep(1000);
  let fileData = fs.readFileSync(path);
  console.log("Uploading to Estuary...");
  try {
    let res = await axios.post(
      `https://upload.estuary.tech/content/add-car`,
      fileData,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );
    console.log("Cleaning up...");
    fs.unlinkSync(path);
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
    console.log(err.response.data);
    console.log(
      `EstuaryJS(addFiles): Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.response.data}`
    );
    return err;
  }
};
