(function () {
  console.log("fetch-override.js is injected");
  const originalFetch = window.fetch;
  window.fetch = async (input, options = {}) => {
    try {
      const url = input.url || input.toString();
      console.log("url", url);
      if (Object.keys(options).length > 0) {
        console.log("options: ", options);
      }
      return originalFetch.call(this, input, options);
    } catch (e) {
      console.error("error during fetch", e);
      return originalFetch.call(this, input, options);
    }
  };
})();
