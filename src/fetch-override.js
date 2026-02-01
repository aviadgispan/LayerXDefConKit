(function () {
  console.log("fetch-override.js is injected");
  function statusDisallowsBody(status) {
    return status === 204 || status === 304 || (status >= 100 && status < 200);
  }
  const originalFetch = window.fetch;
  window.fetch = async (input, options = {}) => {
    try {
      const url = input.url || input.toString();
      console.log("url", url);
      if (Object.keys(options).length > 0) {
        console.log("options:", options);
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
          console.log("text", text);
          controller.enqueue(chunk); // Pass the chunk forward
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
