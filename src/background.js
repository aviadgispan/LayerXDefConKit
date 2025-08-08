let remoteJson;
const remoteServerUrl = "http://localhost:5555";

const onFetchDataHandler = (message) => {
  fetch(`${remoteServerUrl}/fetch-data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
};

const handlers = {
  onFetchDataHandler,
};
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handlers.onMessageHandler(message, sender, sendResponse);
  return true;
});

