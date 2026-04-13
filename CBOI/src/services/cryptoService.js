import CryptoJS from "crypto-js";

const AES_KEY = "82gbZpEWVzTcL5qXB+kSKCes7XbqdNxqKjQeDgdnJX0=";

/**
 * Port of Java AESUtils prepending IV (16 bytes) to the ciphertext.
 */

function base64ToBytes(b64) {
  const binary = atob(b64);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function bytesToBase64(bytes) {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function importKey(keyBytes, usage) {
  return crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-CBC" },
    false,
    [usage]
  );
}

function removeNoise(data) {
  const lastCurly = data.lastIndexOf("}");
  const lastBracket = data.lastIndexOf("]");
  const lastIndex = Math.max(lastCurly, lastBracket);
  return lastIndex !== -1 ? data.substring(0, lastIndex + 1) : data;
}

export async function encryptRequest(payload) {
  const keyBytes = base64ToBytes(AES_KEY);
  const cryptoKey = await importKey(keyBytes, "encrypt");
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const plainText = typeof payload === "string" ? payload : JSON.stringify(payload);
  const plainBytes = new TextEncoder().encode(plainText);

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    cryptoKey,
    plainBytes
  );

  const encryptedBytes = new Uint8Array(encryptedBuffer);
  const result = new Uint8Array(iv.length + encryptedBytes.length);
  result.set(iv, 0);
  result.set(encryptedBytes, iv.length);

  return bytesToBase64(result);
}

export async function decryptResponse(cipherText) {
  try {
    const rawInput = typeof cipherText === "string" ? cipherText : cipherText.ResponseData || JSON.stringify(cipherText);
    const combined = base64ToBytes(rawInput);
    const iv = combined.slice(0, 16);
    const encrypted = combined.slice(16);

    const keyBytes = base64ToBytes(AES_KEY);
    const cryptoKey = await importKey(keyBytes, "decrypt");

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv },
      cryptoKey,
      encrypted
    );

    const raw = new TextDecoder("utf-8").decode(decryptedBuffer);
    return JSON.parse(removeNoise(raw));
  } catch (err) {
    console.error("[CryptoService] Decryption failed:", err);
    throw err;
  }
}
  