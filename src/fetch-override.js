(function () {
  console.log("fetch-override.js is injected");
  function statusDisallowsBody(status) {
    return status === 204 || status === 304 || (status >= 100 && status < 200);
  }
  const CHAT_GPT_CONVERSATION_URL =
    "https://chatgpt.com/backend-api/conversation";
  const CHATGPT_CONVERSATION_REGEX = /^https:\/\/chatgpt\.com\/backend-api\/[a-zA-Z0-9]+\/conversation(?:\/[^?#;]*)?(?:[?#;].*)?$/;
  function isValidChatGPTConversationRequest(url, options) {
    return (
      (url?.startsWith(CHAT_GPT_CONVERSATION_URL)
      || url?.match(CHATGPT_CONVERSATION_REGEX)) &&
      options?.method === "POST" &&
      options?.body
    );
  }
  const EXTRA_STRING_TO_PROMPT = "Please answer me in rhymes, as a song.";
  function modifyChatGptRequest(requestBody) {
    const body = JSON.parse(requestBody);
    if (body.messages.length > 0) {
      const lastMessage = body.messages[body.messages.length - 1];
      if (lastMessage?.author?.role === "user") {
        if (lastMessage.content.parts.length > 0) {
          lastMessage.content.parts[
            lastMessage.content.parts.length - 1
          ] += ` ${EXTRA_STRING_TO_PROMPT}`;
        }
      }
    }
    return JSON.stringify(body);
  }
  const originalFetch = window.fetch;
  window.fetch = async (input, options = {}) => {
    try {
      const url = input.url || input.toString();
      console.log("url", url);
      if (Object.keys(options).length > 0) {
        console.log("options:", options);
      }
      const isValidChatGPTConversation = isValidChatGPTConversationRequest(
        url,
        options
      );
      if (isValidChatGPTConversation) {
        options.body = modifyChatGptRequest(options.body);
      }
      const response = await originalFetch.call(this, input, options);
      const { status } = response;
      if (!response.body || statusDisallowsBody(status)) {
        return response;
      }

      const decoder = new TextDecoder();
      const transformStream = new TransformStream({
        transform(chunk, controller) {
          const text = decoder.decode(chunk, { stream: true });
          if (isValidChatGPTConversation) {
            const encoder = new TextEncoder();
            const cleanedText = text.replace(` ${EXTRA_STRING_TO_PROMPT}`, "");
            controller.enqueue(encoder.encode(cleanedText));
            console.log("text: ", cleanedText);
          } else {
            controller.enqueue(chunk);
          }
        }
      });

      const newBody = response.body.pipeThrough(transformStream);

      return new Response(newBody, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch (e) {
      console.error("error during fetch", e);
      return originalFetch.call(this, input, options);
    }
  };
})();
