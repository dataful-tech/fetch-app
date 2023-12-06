const FetchApp = require("../src/FetchApp");

global.UrlFetchApp = require("./mocks/UrlFetchApp");
global.Utilities = require("./mocks/Utilities");
global.console = require("./mocks/console");

const url = "https://example.com/api/data";
const params = { method: "get" };
const paramsExpected = {
  ...params,
  muteHttpExceptions: true,
};

describe("FetchApp tests", () => {
  beforeEach(() => {
    UrlFetchApp.fetch.mockClear();
    Utilities.sleep.mockClear();
    console.log.mockClear();
  });

  it("FetchApp.fetch without configuration, simple pass-through to UrlFetchApp", () => {
    const result = FetchApp.fetch(url, params);

    expect(result.getResponseCode()).toBe(200);
    expect(result.getContentText()).toContain("Mock response for URL");
    expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(1);
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(url, paramsExpected);
    expect(Utilities.sleep).toHaveBeenCalledTimes(0);
    expect(console.log).toHaveBeenCalledTimes(0);
  });

  it("FetchApp.fetch without configuration and params, simple pass-through to UrlFetchApp", () => {
    const result = FetchApp.fetch(url);

    expect(result.getResponseCode()).toBe(200);
    expect(result.getContentText()).toContain("Mock response for URL");
    expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(1);
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(url, {
      muteHttpExceptions: true,
    });
    expect(Utilities.sleep).toHaveBeenCalledTimes(0);
    expect(console.log).toHaveBeenCalledTimes(0);
  });

  it("FetchApp.fetch with maxRetries, failed, returns null", () => {
    const config = {
      maxRetries: 3,
      retryCodes: [200],
    };
    const result = FetchApp.fetch(url, params, config);

    expect(result).toBe(null);
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(url, paramsExpected);
    expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(4);
    // 1 original request + 3 retries + 1 total fail message
    expect(console.log).toHaveBeenCalledTimes(5);
  });

  it("FetchApp.fetch with success on the last retry, success codes only", () => {
    const config = {
      maxRetries: 3,
      successCodes: [200],
    };
    UrlFetchApp.fetch
      .mockImplementationOnce(() => {
        return {
          getResponseCode: () => 500,
        };
      })
      .mockImplementationOnce(() => {
        return {
          getResponseCode: () => 500,
        };
      })
      .mockImplementationOnce(() => {
        return {
          getResponseCode: () => 500,
        };
      })
      .mockImplementationOnce(() => {
        return {
          getResponseCode: () => 200,
          getContentText: () => `Mock response for URL: ${url}`,
        };
      });
    const result = FetchApp.fetch(url, params, config);

    expect(result).not.toBe(null);
    expect(result.getResponseCode()).toBe(200);
    expect(result.getContentText()).toBe(`Mock response for URL: ${url}`);
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(url, paramsExpected);
    expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(4);
    expect(Utilities.sleep).toHaveBeenCalledTimes(3);
    expect(Utilities.sleep).toHaveBeenCalledWith(0);
    expect(console.log).toHaveBeenCalledTimes(3);
  });

  it("FetchApp.fetch with success on a retry, retry codes only", () => {
    const config = {
      maxRetries: 3,
      retryCodes: [500],
    };
    UrlFetchApp.fetch
      .mockImplementationOnce(() => {
        return {
          getResponseCode: () => 500,
        };
      })
      .mockImplementationOnce(() => {
        return {
          getResponseCode: () => 200,
          getContentText: () => `Mock response for URL: ${url}`,
        };
      });
    const result = FetchApp.fetch(url, params, config);

    expect(result).not.toBe(null);
    expect(result.getResponseCode()).toBe(200);
    expect(result.getContentText()).toBe(`Mock response for URL: ${url}`);
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(url, paramsExpected);
    expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(2);
    expect(Utilities.sleep).toHaveBeenCalledTimes(1);

    expect(Utilities.sleep).toHaveBeenCalledWith(0);

    expect(console.log).toHaveBeenCalledTimes(1);
  });

  it("FetchApp.fetch with exponential delay", () => {
    const config = {
      maxRetries: 5,
      retryCodes: [200],
      delayFactor: 2,
      delay: 100,
    };
    const result = FetchApp.fetch(url, params, config);

    expect(result).toBe(null);
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(url, paramsExpected);
    expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(6);
    expect(Utilities.sleep).toHaveBeenCalledTimes(5);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(1, 100);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(2, 200);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(3, 400);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(4, 800);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(5, 1600);

    expect(console.log).toHaveBeenCalledTimes(7);
  });

  it("FetchApp.fetch with constant delay", () => {
    const config = {
      maxRetries: 5,
      retryCodes: [200],
      delayFactor: 1,
      delay: 100,
    };
    const result = FetchApp.fetch(url, params, config);

    expect(result).toBe(null);
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(url, paramsExpected);
    expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(6);
    expect(Utilities.sleep).toHaveBeenCalledTimes(5);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(1, 100);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(2, 100);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(3, 100);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(4, 100);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(5, 100);
    expect(console.log).toHaveBeenCalledTimes(7);
  });

  it("Test FetchApp client without configuration, simple pass-through to UrlFetchApp", () => {
    const client = FetchApp.getClient();
    const result = client.fetch(url, params);

    expect(result.getResponseCode()).toBe(200);
    expect(result.getContentText()).toContain("Mock response for URL");
    expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(1);
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(url, paramsExpected);
    expect(Utilities.sleep).toHaveBeenCalledTimes(0);
    expect(console.log).toHaveBeenCalledTimes(0);
  });

  it("Test FetchApp client with configuration", () => {
    const client = FetchApp.getClient({
      maxRetries: 3,
      retryCodes: [200],
      delayFactor: 2,
      delay: 100,
    });
    const result = client.fetch(url, params);

    expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(4);
    expect(result).toBe(null);
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(url, paramsExpected);
    expect(Utilities.sleep).toHaveBeenCalledTimes(3);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(1, 100);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(2, 200);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(3, 400);
    expect(console.log).toHaveBeenCalledTimes(5);
  });

  it("Test FetchApp client with configuration and without params", () => {
    const client = FetchApp.getClient({
      maxRetries: 3,
      retryCodes: [200],
      delayFactor: 2,
      delay: 100,
    });
    const result = client.fetch(url);

    expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(4);
    expect(result).toBe(null);
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(url, {
      muteHttpExceptions: true,
    });
    expect(Utilities.sleep).toHaveBeenCalledTimes(3);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(1, 100);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(2, 200);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(3, 400);
    expect(console.log).toHaveBeenCalledTimes(5);
  });

  it("Test FetchApp client with exponential delay", () => {
    const client = FetchApp.getClient({
      maxRetries: 5,
      retryCodes: [200],
      delayFactor: 2,
      delay: 100,
    });
    const result = client.fetch(url, params);

    expect(result).toBe(null);
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(url, paramsExpected);
    expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(6);
    expect(Utilities.sleep).toHaveBeenCalledTimes(5);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(1, 100);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(2, 200);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(3, 400);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(4, 800);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(5, 1600);
    expect(console.log).toHaveBeenCalledTimes(7);
  });

  it("Test FetchApp client with exponential delay up to maxDelay", () => {
    const client = FetchApp.getClient({
      maxRetries: 5,
      retryCodes: [200],
      delayFactor: 2,
      delay: 100,
      maxDelay: 1000,
    });
    const result = client.fetch(url, params);

    expect(result).toBe(null);
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(url, paramsExpected);
    expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(6);
    expect(Utilities.sleep).toHaveBeenCalledTimes(5);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(1, 100);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(2, 200);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(3, 400);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(4, 800);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(5, 1000);
    expect(console.log).toHaveBeenCalledTimes(7);
  });

  it("Test FetchApp client with constant delay", () => {
    const client = FetchApp.getClient({
      maxRetries: 5,
      retryCodes: [200],
      delayFactor: 1,
      delay: 100,
    });
    const result = client.fetch(url, params);

    expect(result).toBe(null);
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(url, paramsExpected);
    expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(6);
    expect(Utilities.sleep).toHaveBeenCalledTimes(5);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(1, 100);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(2, 100);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(3, 100);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(4, 100);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(5, 100);
    expect(console.log).toHaveBeenCalledTimes(7);
  });

  it("Test overriding client config for a specific request", () => {
    const client = FetchApp.getClient({
      maxRetries: 5,
      retryCodes: [200],
      delayFactor: 1,
      delay: 100,
    });

    const result = client.fetch(url, params);
    expect(result).toBe(null);
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(url, paramsExpected);
    expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(6);
    expect(Utilities.sleep).toHaveBeenCalledTimes(5);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(1, 100);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(2, 100);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(3, 100);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(4, 100);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(5, 100);
    expect(console.log).toHaveBeenCalledTimes(7);

    UrlFetchApp.fetch.mockClear();
    Utilities.sleep.mockClear();
    console.log.mockClear();

    const result2 = client.fetch(url, params, {
      maxRetries: 3,
      retryCodes: [200],
      delayFactor: 2,
      delay: 100,
      maxDelay: 250,
    });

    expect(result2).toBe(null);
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(url, {
      ...params,
      muteHttpExceptions: true,
    });
    expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(4);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(1, 100);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(2, 200);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(3, 250);
    expect(console.log).toHaveBeenCalledTimes(5);
  });

  it("Test FetchApp client class directly, simple pass-through to UrlFetchApp", () => {
    const params = {
      method: "get",
    };
    const client = new FetchApp.FetchApp();
    const result = client.fetch(url, params);

    expect(result.getResponseCode()).toBe(200);
    expect(result.getContentText()).toContain("Mock response for URL");
    expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(1);
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(url, {
      ...params,
      muteHttpExceptions: true,
    });
    expect(Utilities.sleep).toHaveBeenCalledTimes(0);
    expect(console.log).toHaveBeenCalledTimes(0);
  });

  it("Test FetchApp client class directly, static fetch, simple pass-through to UrlFetchApp", () => {
    const result = FetchApp.FetchApp.fetch(url, params);

    expect(result.getResponseCode()).toBe(200);
    expect(result.getContentText()).toContain("Mock response for URL");
    expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(1);
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(url, paramsExpected);
    expect(Utilities.sleep).toHaveBeenCalledTimes(0);
    expect(console.log).toHaveBeenCalledTimes(0);
  });

  it("Test FetchApp client class directly, static fetch, no params, simple pass-through to UrlFetchApp", () => {
    const result = FetchApp.FetchApp.fetch(url);

    expect(result.getResponseCode()).toBe(200);
    expect(result.getContentText()).toContain("Mock response for URL");
    expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(1);
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(url, {
      muteHttpExceptions: true,
    });
    expect(Utilities.sleep).toHaveBeenCalledTimes(0);
    expect(console.log).toHaveBeenCalledTimes(0);
  });

  it("Test FetchApp client class directly, no params, simple pass-through to UrlFetchApp", () => {
    const client = new FetchApp.FetchApp();
    const result = client.fetch(url);

    expect(result.getResponseCode()).toBe(200);
    expect(result.getContentText()).toContain("Mock response for URL");
    expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(1);
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(url, {
      muteHttpExceptions: true,
    });
    expect(Utilities.sleep).toHaveBeenCalledTimes(0);
    expect(console.log).toHaveBeenCalledTimes(0);
  });

  it("Test FetchApp client class directly, with config and override", () => {
    const client = new FetchApp.FetchApp({
      maxRetries: 5,
      retryCodes: [200],
      delayFactor: 1,
      delay: 100,
    });

    const result = client.fetch(url, params);
    expect(result).toBe(null);
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(url, paramsExpected);
    expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(6);
    expect(Utilities.sleep).toHaveBeenCalledTimes(5);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(1, 100);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(2, 100);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(3, 100);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(4, 100);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(5, 100);
    expect(console.log).toHaveBeenCalledTimes(7);

    UrlFetchApp.fetch.mockClear();
    Utilities.sleep.mockClear();
    console.log.mockClear();

    const result2 = client.fetch(url, params, {
      maxRetries: 3,
      retryCodes: [200],
      delayFactor: 2,
      delay: 100,
      maxDelay: 250,
    });

    expect(result2).toBe(null);
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(url, paramsExpected);
    expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(4);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(1, 100);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(2, 200);
    expect(Utilities.sleep).toHaveBeenNthCalledWith(3, 250);
    expect(console.log).toHaveBeenCalledTimes(5);
  });

  it("Test _getConfig", () => {
    // Test default config
    expect(FetchApp.FetchApp._getConfig()).toEqual({
      maxRetries: 0,
      successCodes: [],
      retryCodes: [],
      delayFactor: 1,
      delay: 0,
      maxDelay: Infinity,
      onRequestFailure: FetchApp.defaultConfig_.onRequestFailure,
      onAllRequestsFailure: FetchApp.defaultConfig_.onAllRequestsFailure,
    });

    // Test default config with empty overrides
    expect(FetchApp.FetchApp._getConfig({})).toEqual({
      maxRetries: 0,
      successCodes: [],
      retryCodes: [],
      delayFactor: 1,
      delay: 0,
      maxDelay: Infinity,
      onRequestFailure: FetchApp.defaultConfig_.onRequestFailure,
      onAllRequestsFailure: FetchApp.defaultConfig_.onAllRequestsFailure,
    });

    // Test default config with partial overrides
    expect(
      FetchApp.FetchApp._getConfig({
        maxRetries: 3,
        retryCodes: [200],
        delayFactor: 2,
        delay: 100,
        maxDelay: 250,
      })
    ).toEqual({
      maxRetries: 3,
      successCodes: [],
      retryCodes: [200],
      delayFactor: 2,
      delay: 100,
      maxDelay: 250,
      onRequestFailure: FetchApp.defaultConfig_.onRequestFailure,
      onAllRequestsFailure: FetchApp.defaultConfig_.onAllRequestsFailure,
    });

    const config = {
      maxRetries: 3,
      successCodes: [200],
      retryCodes: [200],
      delayFactor: 2,
      delay: 100,
      maxDelay: 250,
      onRequestFailure: () => {},
      onAllRequestsFailure: () => {},
    };

    // Test default config with all overrides
    expect(FetchApp.FetchApp._getConfig(config)).toEqual(config);
  });

  it("Test callback functions", () => {
    const onRequestFailureMock = jest.fn();
    const onAllRequestsFailureMock = jest.fn();

    const config = {
      maxRetries: 3,
      retryCodes: [500],
      onRequestFailure: onRequestFailureMock,
      onAllRequestsFailure: onAllRequestsFailureMock,
    };

    const client = new FetchApp.FetchApp(config);

    const response1 = {
      getResponseCode: () => 500,
    };
    const response2 = {
      getResponseCode: () => 500,
    };

    UrlFetchApp.fetch
      .mockImplementationOnce(() => response1)
      .mockImplementationOnce(() => response1)
      .mockImplementationOnce(() => response1)
      .mockImplementationOnce(() => response2);

    const result = client.fetch(url, params);

    expect(result).toBe(null);
    expect(onAllRequestsFailureMock).toHaveBeenCalledTimes(1);
    expect(onAllRequestsFailureMock).toHaveBeenCalledWith({
      url,
      params: paramsExpected,
      config: { ...FetchApp.defaultConfig_, ...config },
      retries: 3,
      response: response2,
    });
    expect(onRequestFailureMock).toHaveBeenCalledTimes(4);
    expect(onRequestFailureMock).toHaveBeenNthCalledWith(1, {
      url,
      params: paramsExpected,
      config: { ...FetchApp.defaultConfig_, ...config },
      retries: 0,
      response: response1,
    });
    expect(onRequestFailureMock).toHaveBeenNthCalledWith(2, {
      url,
      params: paramsExpected,
      config: { ...FetchApp.defaultConfig_, ...config },
      retries: 1,
      response: response1,
    });
    expect(onRequestFailureMock).toHaveBeenNthCalledWith(3, {
      url,
      params: paramsExpected,
      config: { ...FetchApp.defaultConfig_, ...config },
      retries: 2,
      response: response1,
    });
    expect(onRequestFailureMock).toHaveBeenNthCalledWith(4, {
      url,
      params: paramsExpected,
      config: { ...FetchApp.defaultConfig_, ...config },
      retries: 3,
      response: response2,
    });
  });

  it("Test throwing exception from a callback function", () => {
    const stopRequest = ({ url, response }) => {
      const responseCode = response.getResponseCode();
      if (responseCode === 401) {
        throw new Error(`Received ${responseCode} when accessing ${url}`);
      }
    };

    const response1 = {
      getResponseCode: () => 429,
    };
    const response2 = {
      getResponseCode: () => 401,
    };

    UrlFetchApp.fetch
      .mockImplementationOnce(() => response1)
      .mockImplementationOnce(() => response2);

    const config = {
      successCodes: [200],
      maxRetries: 5,
      delay: 500,
      onRequestFailure: stopRequest,
    };

    expect(() => FetchApp.fetch(url, params, config)).toThrow(
      `Received 401 when accessing ${url}`
    );
  });
});
