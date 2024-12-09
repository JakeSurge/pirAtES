import axios from 'axios';
import { Buffer } from "buffer";

const url = "http://127.0.0.1:5000/";

type Format = "utf-8" | "base64";

const generateRandomString = (length: number): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export interface PiratifyResponse {
  piratetext: string;
  iv: string;
  encodedKey: string;
}

export async function piratify(
  plainText: string,
  key: string,
  aesMode: string,
  format: string,
  customIV?: string
): Promise<PiratifyResponse> {
  try {
    let iv: string | undefined;
    let encodedKey = key;

    // Encode the key to base64 if format is base64
    if (format === "base64") {
      encodedKey = Buffer.from(key, "utf-8").toString("base64");

      // Encode customIV to base64 if provided
      if (customIV) {
        iv = Buffer.from(customIV, "utf-8").toString("base64");
      }
    }

    // Construct the request body
    const requestBody = {
      plaintext: plainText,
      key: {
        keyValue: key,
        keyFormat: format,
      },
      aesMode: aesMode,
      iv: iv ? { ivValue: iv, ivFormat: format } : undefined, // Include IV only if provided
    };

    const response = await axios.post(`${url}piratify`, requestBody);

    const { piratetext, iv: responseIv } = response.data;

    return {
      piratetext,
      iv: responseIv,
      encodedKey,
    };
  } catch (error) {
    console.error("You don broken the pratification!:", error);
    throw new Error("Arrrr! Woe, it be to the depths with ye!");
  }
}

export async function unpiratify(
  cipherText: string,
  key: string,
  aesMode: string,
  format: string,
  iv: string
): Promise<string> {
  try {
    const requestBody = {
      piratetext: cipherText,
      key: {
        keyValue: key,
        keyFormat: format,
      },
      aesMode: aesMode,
      iv: { ivValue: iv, ivFormat: format },
    };

    console.log("Request Body:", requestBody);

    const response = await axios.post(`${url}unpiratify`, requestBody);
    const { plaintext } = response.data;
    return plaintext;
  } catch (error) {
    console.error("Captain, unpiratification failed!", error);
    throw new Error("What's this? Ye failed unpiratifying me riddle me boy!");
  }
}
