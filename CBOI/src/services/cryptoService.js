import CryptoJS from "crypto-js";

const AES_KEY = "82gbZpEWVzTcL5qXB+kSKCes7XbqdNxqKjQeDgdnJX0=";


/**
 * encryption.service.js
 * ─────────────────────────────────────────────────────────────
 * AES-CBC-PKCS7 encrypt / decrypt — pure browser implementation.
 *
 * Why local instead of the iServeu encr/decr API?
 *   The external API throws CORS errors in the browser. This is a
 *   direct port of the Java AESUtils class provided by the backend
 *   team, using the browser's native Web Crypto API.
 *
 * Java → JS mapping:
 *   Base64.getDecoder().decode(key)          → base64ToBytes(key)
 *   Cipher.getInstance("AES/CBC/PKCS5Padding")→ subtle.encrypt("AES-CBC")
 *     (PKCS5Padding == PKCS7Padding for 128-bit blocks — Web Crypto
 *      applies PKCS7 automatically for AES-CBC)
 *   SecureRandom → crypto.getRandomValues()
 *   prepend IV to ciphertext                 → same
 *   Base64.getEncoder().encodeToString()     → bytesToBase64()
 *   removeNoise()                            → removeNoise() — identical logic
 *
 * Public API (consumed only by http.service.js):
 *   encryptPayload(payload: object) → Promise<string>   Base64 string
 *   decryptPayload(cipher: string)  → Promise<object>   parsed JS object
 * ─────────────────────────────────────────────────────────────
 */

// ── Base64 helpers ────────────────────────────────────────────

/** Base64 string → Uint8Array  (mirrors Java Base64.getDecoder().decode()) */
function base64ToBytes(b64) {
  const binary = atob(b64);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

/** Uint8Array → Base64 string  (mirrors Java Base64.getEncoder().encodeToString()) */
function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

// ── Key import ────────────────────────────────────────────────

/**
 * Import the raw AES key bytes into a CryptoKey object.
 * Called once per encrypt/decrypt operation — Web Crypto requires this.
 *
 * @param {Uint8Array} keyBytes
 * @param {"encrypt"|"decrypt"} usage
 * @returns {Promise<CryptoKey>}
 */
async function importKey(keyBytes, usage) {
  return crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-CBC" },
    false,         // not extractable
    [usage]
  );
}

// ── removeNoise ───────────────────────────────────────────────

/**
 * Port of Java's removeNoise().
 * After decryption, PKCS7 padding removal leaves a clean string but
 * occasionally trailing bytes sneak through. This trims everything
 * after the last `}` or `]` — guaranteeing valid JSON.
 *
 * @param {string} data
 * @returns {string}
 */
function removeNoise(data) {
  const lastCurly   = data.lastIndexOf("}");
  const lastBracket = data.lastIndexOf("]");
  const lastIndex   = Math.max(lastCurly, lastBracket);
  return lastIndex !== -1 ? data.substring(0, lastIndex + 1) : data;
}

// ── Encrypt ───────────────────────────────────────────────────

/**
 * Encrypts a JS object using AES-CBC with a random IV.
 *
 * Java equivalent:
 *   encryptRequest(Object incomingJsonReq, String key)
 *
 * Algorithm:
 *   1. Base64-decode the AES key
 *   2. Generate 16 random IV bytes  (SecureRandom)
 *   3. UTF-8 encode the JSON string  (getBytes(StandardCharsets.UTF_8))
 *   4. AES-CBC encrypt with PKCS7 padding  (AES/CBC/PKCS5Padding)
 *   5. Concatenate: [ iv (16 bytes) | ciphertext ]
 *   6. Base64-encode the combined bytes
 *
 * @param {object} payload  Plain JS object to encrypt.
 * @returns {Promise<string>}  Base64-encoded IV+ciphertext string.
 */
export async function encryptRequest(payload) {
  if (!AES_KEY) {
    throw new Error("VITE_AES_KEY is not set in .env");
  }

  // Step 1 — decode key
  const keyBytes = base64ToBytes(AES_KEY);
  const cryptoKey = await importKey(keyBytes, "encrypt");

  // Step 2 — random 16-byte IV
  const iv = crypto.getRandomValues(new Uint8Array(16));

  // Step 3 — UTF-8 encode the JSON payload
  const plainText   = typeof payload === "string" ? payload : JSON.stringify(payload);
  const plainBytes  = new TextEncoder().encode(plainText);

  // Step 4 — AES-CBC encrypt (Web Crypto applies PKCS7 padding automatically)
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    cryptoKey,
    plainBytes
  );

  // Step 5 — prepend IV to ciphertext  (mirrors System.arraycopy in Java)
  const encryptedBytes = new Uint8Array(encryptedBuffer);
  const result = new Uint8Array(iv.length + encryptedBytes.length);
  result.set(iv, 0);
  result.set(encryptedBytes, iv.length);

  // Step 6 — Base64 encode
  return bytesToBase64(result);
}

// ── Decrypt ───────────────────────────────────────────────────

/**
 * Decrypts a Base64 AES-CBC string back into a JS object.
 *
 * Java equivalent:
 *   decryptRequest(String encryptedString, String key)
 *
 * Algorithm:
 *   1. Base64-decode the input  (Base64.getDecoder().decode())
 *   2. First 16 bytes = IV      (Arrays.copyOfRange(0, 16))
 *   3. Remaining bytes = ciphertext
 *   4. AES-CBC decrypt
 *   5. UTF-8 decode the result
 *   6. removeNoise() to strip any trailing garbage
 *   7. JSON.parse the clean string
 *
 * @param {string} cipherText  Base64-encoded IV+ciphertext from the API.
 * @returns {Promise<object>}  Parsed JS object.
 */
export async function decryptResponse(cipherText) {
  if (!AES_KEY) {
    throw new Error("VITE_AES_KEY is not set in .env");
  }

  try {
    // Step 1 — Base64 decode
    const combined = base64ToBytes(
      typeof cipherText === "string" ? cipherText : JSON.stringify(cipherText)
    );

    // Step 2-3 — split IV and ciphertext
    const iv         = combined.slice(0, 16);
    const encrypted  = combined.slice(16);

    // Step 1 — decode key and import
    const keyBytes  = base64ToBytes(AES_KEY);
    const cryptoKey = await importKey(keyBytes, "decrypt");

    // Step 4 — AES-CBC decrypt
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv },
      cryptoKey,
      encrypted
    );

    // Step 5 — UTF-8 decode
    const raw = new TextDecoder("utf-8").decode(decryptedBuffer).trim();

    // Step 6 — remove noise  (same logic as Java removeNoise())
    const clean = removeNoise(raw);

    // Step 7 — parse JSON
    return JSON.parse(clean);
  } catch (err) {
    console.log("[Encryption] Decryption failed:", err);
    throw new Error("Failed to decrypt API response — check VITE_AES_KEY");
  }

}
  



//   export const encryptRequest = (data) => {
//   console.log('encrypted parameter >>>',data)
//   try {
//     const jsonString = JSON.stringify(data);
//     const encrypted = CryptoJS.AES.encrypt(jsonString, parsedKey, {
//       mode: CryptoJS.mode.ECB,
//       padding: CryptoJS.pad.Pkcs7,
//     });
//     console.log('encrypted data >>>',encrypted.toString())
//     return { RequestData: encrypted.toString() };
//   } catch (error) {
//     console.error("Encryption failed:", error);
//     throw error;
//   }
// };

// export const decryptResponse = (responseData) => {
//   try {
//     if (!responseData || !responseData.ResponseData) {
//       return responseData; // If it's not encrypted, return as is
//     }
//     const decrypted = CryptoJS.AES.decrypt(responseData.ResponseData, parsedKey, {
//       mode: CryptoJS.mode.ECB,
//       padding: CryptoJS.pad.Pkcs7,
//     });
//     const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
//     return JSON.parse(decryptedString);
//   } catch (error) {
//     console.error("Decryption failed:", error);
//     throw error;
//   }
// };