const authConfig = {
  clientId: "02WnEFxSElzxzrv3Qht29IacaiO6qKa3pclXleoo",

  authorizationEndpoint:
    "https://cboi-auth-stage.isupay.in/application/o/authorize/",

  // token endpoint
  tokenEndpoint:
    "https://cboi-auth-stage.isupay.in/application/o/token/",


  redirectUri: "http://localhost:3000/callback",

  scopes:
    "openid profile email offline_access authorities privileges user_name created adminName bankCode goauthentik.io/api",
};



function generateRandomString(length = 64) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((v) => chars[v % chars.length])
    .join("");
}

async function sha256(plainText) {
  const encoder = new TextEncoder();
  return crypto.subtle.digest("SHA-256", encoder.encode(plainText));
}

function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}


// Login Function.
export async function login() {
  const codeVerifier = generateRandomString(64); // used later for security (PKCE)
  const state = generateRandomString(16); // prevents hacking (CSRF)

  // Storing these values in local storage, we will need them later.
  localStorage.setItem("code_verifier", codeVerifier);
  localStorage.setItem("auth_state", state);

  const hashed = await sha256(codeVerifier); // secret kept private
  const codeChallenge = base64UrlEncode(hashed); // this will be sent first to the server.
  // OAuth flow:
  // Send challenge
  // Later send verifier

  const authUrl =
    `${authConfig.authorizationEndpoint}?` +
    `client_id=${authConfig.clientId}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(authConfig.redirectUri)}` +
    `&scope=${encodeURIComponent(authConfig.scopes)}` +
    `&state=${state}` +
    `&code_challenge=${codeChallenge}` +
    `&code_challenge_method=S256`;

  // This sends user to Authentik
  window.location.href = authUrl;
}
// Includes: client_id, redirect_uri, scope, state, code_challenge



// CallBack function : Converts "code" → "access token"
export async function handleCallback() {
  const params = new URLSearchParams(window.location.search); // Extracts code and   state from URL

  const code = params.get("code");
  const returnedState = params.get("state");

  // Retrieve stored values as we have stored in login()
  const savedState = localStorage.getItem("auth_state");
  const codeVerifier = localStorage.getItem("code_verifier");

  // Validation

  if (!code) throw new Error("No code found in URL");

  if (returnedState !== savedState) {
    throw new Error("Invalid state (possible CSRF attack)");
  }

  if (!codeVerifier) {
    throw new Error("Missing code verifier");
  }


  // Token exchange here
  const response = await fetch(authConfig.tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: authConfig.clientId,
      code,
      redirect_uri: authConfig.redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  const data = await response.json();
  // console.log("handleCallback() fn >>>", data)

  if (!response.ok) {
    throw new Error(data.error || "Token exchange failed");
  }


  // Store token for future use..
  localStorage.setItem("token", data.access_token);

  // Clean temporary data
  localStorage.removeItem("code_verifier");
  localStorage.removeItem("auth_state");

  // Return user data.
  return {
    profiles: [{ name: "Demo User" }], // you can replace with API later
  };
}