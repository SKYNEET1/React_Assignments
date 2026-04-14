import axios from "axios";
import { encryptRequest, decryptResponse } from "./cryptoService";

const SERVICES_UAT = "https://api-preprod.txninfra.com/encrV4/CBOI";
const ENCR_UAT = "https://api-preprod.txninfra.com/encrV4/CBOI";
const USER_UAT = "https://api-preprod.txninfra.com/encrV4/CBOI";
const PLAIN_UAT = "https://api-preprod.txninfra.com/CBOI";
const REPORTS_UAT = "https://services-cboi-uat.isupay.in/CBOI/reports";

const PASS_KEY = "c0CKRG7yNFY3OIxY92izqj0YeMk6JPqdOlGgqsv3mhicXmAv";

const baseHeaders = {
  "Content-Type": "application/json",
  "pass_key": PASS_KEY
};

const getAuthToken = () => localStorage.getItem("token");

const isTokenExpired = (token) => {
  const payload = JSON.parse(atob(token.split('.')[1]));
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};

export const decodeToken = (token) => {

  if (isTokenExpired(token)) {
    console.log("Token expired ❌");
    // redirect to login OR refresh token
  }

  try {
    const base64Url = token.split(".")[1]; 
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("JWT Decode Error:", e);
    return null;
  }
};

const attachToken = (config) => {
  const token = getAuthToken();
  console.log(`[api.js:45] Request intercepted for: ${config.url}`);

  if (token) {
    const payload = decodeToken(token);
    const properties = {
      user_name: payload?.user_name || payload?.preferred_username || "9348781833",
      bankCode: payload?.bankCode || "cboi",
      authorities: payload?.authorities || payload?.groups || ["ROLE_RETAILER"]
    };
    const stringifiedProps = JSON.stringify(properties);
    const b64Props = btoa(stringifiedProps);

    const newHeaders = {
      ...config.headers,
      "Authorization": token,
      "pass_key": PASS_KEY
    };

    config.headers = newHeaders;
    console.log(`[api.js:68] Headers attached with JWT for user: ${properties.user_name}`);
  } else {
    console.log("[api.js:70] No token found in localStorage");
  }

  return config;
};

// Axios Instances
const apiServices = axios.create({ baseURL: SERVICES_UAT, headers: baseHeaders });
const apiEncr = axios.create({ baseURL: ENCR_UAT, headers: baseHeaders });
const apiUser = axios.create({ baseURL: USER_UAT, headers: baseHeaders });
const apiReports = axios.create({ baseURL: REPORTS_UAT, headers: baseHeaders });
const apiPlain = axios.create({ baseURL: PLAIN_UAT, headers: baseHeaders });

apiServices.interceptors.request.use(attachToken);
apiEncr.interceptors.request.use(attachToken);
apiUser.interceptors.request.use(attachToken);
apiReports.interceptors.request.use(attachToken);
apiPlain.interceptors.request.use(attachToken);

// Encrypted Execution wrappers
const executeEncryptedPost = async (url, data) => {
  const fullUrl = `${ENCR_UAT}${url}`;
  console.log(`[api.js:86] POST Request to ${fullUrl} with data:`, data);
  try {
    const encryptedString = await encryptRequest(data);
    const payload = { RequestData: encryptedString };
    
    console.log(`[api.js:90] Encrypted Payload for ${url}:`, payload);
    const response = await apiEncr.post(url, payload);
    
    if (response.data && response.data.ResponseData) {
      console.log(`[api.js:95] Raw Encrypted Response from ${url}:`, response.data.ResponseData);
      response.data = await decryptResponse(response.data.ResponseData);
      console.log(`[api.js:97] Decrypted Response from ${url}:`, response.data);
    }
    return response;
  } catch (error) {
    console.error(`[api.js:99] Error in POST ${url}:`, error.message);
    if (error.response && error.response.data) {
      try {
        if (error.response.data.ResponseData) {
          error.response.data = await decryptResponse(error.response.data.ResponseData);
          console.log(`[api.js:104] Decrypted Error Data from ${url}:`, error.response.data);
        }
      } catch (e) {
        console.warn(`[api.js:107] Failed to decrypt error from ${url}`);
      }
    }
    throw error;
  }
};

const executeEncryptedGet = async (url) => {
  console.log(`[api.js:115] GET Request to ${url}`);
  try {
    const response = await apiEncr.get(url);
    if (response.data && response.data.ResponseData) {
      console.log(`[api.js:120] Raw Encrypted Response from ${url}:`, response.data.ResponseData);
      response.data = await decryptResponse(response.data.ResponseData);
      console.log(`[api.js:122] Decrypted Response from ${url}:`, response.data);
    }
    return response;
  } catch (error) {
    console.error(`[api.js:123] Error in GET ${url}:`, error.message);
    if (error.response && error.response.data) {
      try {
        if (error.response.data.ResponseData) {
          error.response.data = await decryptResponse(error.response.data.ResponseData);
          console.log(`[api.js:128] Decrypted Error Data from ${url}:`, error.response.data);
        }
      } catch (e) {
        console.warn(`[api.js:131] Failed to decrypt error from ${url}`);
      }
    }
    throw error;
  }
};



export const languageUpdateAPI = (data) => {
  console.log("[api.js] Calling languageUpdateAPI");
  return executeEncryptedPost("/isu_soundbox/lang/status_update", { key: "lang_update", message: data });
};

export const deviceLivenessAPI = (data) => {
  console.log("[api.js] Calling deviceLivenessAPI");
  return executeEncryptedPost("/isu_soundbox/lang/status_update", { key: "device_liveness", message: data });
};

export const campaignUpdateAPI = (data) => {
  console.log("[api.js] Calling campaignUpdateAPI");
  return executeEncryptedPost("/isu_soundbox/lang/status_update", { key: "campaign_update", message: data });
};

export const merchantOnboardAPI = (data) => {
  console.log("[api.js] Calling merchantOnboardAPI");
  return executeEncryptedPost("/merchant/bulk-onboard", data);
};

export const merchantFetchAPI = (data) => {
  console.log("[api.js] Calling merchantFetchAPI with:", data);
  return executeEncryptedPost("/fetch/fetchById", data);
};

export const generateQRAPI = (data) => {
  console.log("[api.js] Calling generateQRAPI");
  return executeEncryptedPost("/merchant/qr_convert_to_base64", data);
};

export const fetchLanguageAPI = () => {
  console.log("[api.js] Calling fetchLanguageAPI");
  return executeEncryptedGet("/isu_soundbox/lang/fetch_language");
};

export const checkLanguageStatusAPI = (tid) => {
  console.log(`[api.js] Calling checkLanguageStatusAPI for TID: ${tid}`);
  return executeEncryptedGet(`/isu_soundbox/lang/status_check/${tid}`);
};
export const currentLanguageAPI = (tid) => executeEncryptedGet(`/isu_soundbox/user_api/current_language/${tid}`);
export const submitLanguageUpdateAPI = (data) => executeEncryptedPost("/isu_soundbox/lang/update_language", data);

export const transactionReportAPI = (data) => {
  console.log(`[api.js] Calling non-encrypted transactionReportAPI. Payload:`, data);
  return apiReports.post("/querysubmit_username", data);
};

export const reportStatusAPI = (queryId) => {
  console.log(`[api.js] Calling non-encrypted reportStatusAPI for: ${queryId}`);
  return apiReports.get(`/get_report_status/${queryId}`);
};

export default apiServices;
