// MIT License

// Copyright 2023 Dataful.Tech

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the “Software”), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/**
 * @typedef {Object} FetchAppConfig
 * @property {number} maxRetries Maximum number of retry attempts. Default: `0`.
 * @property {Array.<number>} successCodes HTTP status codes considered as successful. Default: `[]`.
 * @property {Array.<number>} retryCodes HTTP status codes that trigger a retry. Default: `[]`.
 * @property {number} delayFactor Factor to calculate the exponential backoff delay. Default: `1` (constant delay).
 * @property {number} delay Delay between retries in milliseconds, modified by `delayFactor`. Default: `0`.
 * @property {number} maxDelay Maximum delay between retries in milliseconds. Default: `Infinity`.
 * @property {Function} onRequestFailure Callback for each failed request. Default: `({ url, params, response, retries, config }) => {}`.
 * @property {Function} onAllRequestsFailure Callback when all retries fail. Default: `({ url, params, response, retries, config }) => {}`.
 */

/**
 * @typedef {Object} FetchParams
 * @property {string} [method] The HTTP method for the request: 'get', 'delete', 'patch', 'post', or 'put'.
 * @property {Object.<string, string>} [headers] A map of headers for the request.
 * @property {string} [contentType] The MIME type of the payload.
 * @property {string|BlobSource|byte[]} [payload] The payload (e.g., POST body) for the request.
 * @property {boolean} [muteHttpExceptions] If true, the fetch will not throw an exception on failure.
 * @property {string} [validateHttpsCertificates] If false, it will allow requests to sites with invalid certificates.
 * @property {boolean} [followRedirects] If true, the fetch will follow HTTP redirects.
 * @property {boolean} [useIntranet] If true, the fetch can access sites in the intranet.
 * @property {boolean} [escaping] If false, it will not automatically escape the payload.
 */

/**
 * Creates a new FetchApp instance with the given configuration.
 * @param {FetchAppConfig} config The configuration object for the FetchApp.
 * Supported options:
 * - **maxRetries** - Maximum number of retry attempts. Default: `0`.
 * - **successCodes** - HTTP status codes considered as successful. Default: `[]`.
 * - **retryCodes** - HTTP status codes that trigger a retry. Default: `[]`.
 * - **delayFactor** - Factor to calculate the exponential delay. Default: `1`.
 * - **delay** - Delay between retries in milliseconds, modified by `delayFactor`. Default: `0`.
 * - **maxDelay** - Maximum delay between retries in milliseconds. Default: `Infinity`.
 * - **onRequestFailure** - Callback for each failed request. Default: `({ url, params, response, retries, config }) => {}`.
 * - **onAllRequestsFailure** - Callback when all retries fail. Default: `({ url, params, response, retries, config }) => {}`.
 * @returns {FetchApp} An instance of FetchApp.
 */
function getClient(config = {}) {
  return new FetchApp(config);
}

/**
 * Initiates an HTTP request using instance configuration.
 * @param {string} url The URL to fetch.
 * @param {FetchParams=} params Parameters for the request.
 * Supported options:
 * - **method** - The HTTP method for the request: 'get', 'delete', 'patch', 'post', or 'put'.
 * - **headers** - A map of headers for the request.
 * - **contentType** - The MIME type of the payload.
 * - **payload** - The payload (e.g., POST body) for the request.
 * - **muteHttpExceptions** - If true, the fetch will not throw an exception on failure.
 * - **validateHttpsCertificates** - If false, it will allow requests to sites with invalid certificates.
 * - **followRedirects** - If true, the fetch will follow HTTP redirects.
 * - **useIntranet** - If true, the fetch can access sites in the intranet.
 * - **escaping** - If false, it will not automatically escape the payload.
 * @param {FetchAppConfig=} config Additional config for the request.
 * Supported options:
 * - **maxRetries** - Maximum number of retry attempts. Default: `0`.
 * - **successCodes** - HTTP status codes considered as successful. Default: `[]`.
 * - **retryCodes** - HTTP status codes that trigger a retry. Default: `[]`.
 * - **delayFactor** - Factor to calculate the exponential delay. Default: `1`.
 * - **delay** - Delay between retries in milliseconds, modified by `delayFactor`. Default: `0`.
 * - **maxDelay** - Maximum delay between retries in milliseconds. Default: `Infinity`.
 * - **onRequestFailure** - Callback for each failed request. Default: `({ url, params, response, retries, config }) => {}`.
 * - **onAllRequestsFailure** - Callback when all retries fail. Default: `({ url, params, response, retries, config }) => {}`.
 * @returns {UrlFetchApp.HTTPResponse|null} The response object or null if all retries fail.
 */
function fetch(url, params = {}, config = {}) {
  return FetchApp.fetch(url, params, config);
}

/**
 * Class representing a fetch application with automatic retries.
 * @property {FetchAppConfig=} config The configuration object for the FetchApp.
 * Supported options:
 * - **maxRetries** - Maximum number of retry attempts. Default: `0`.
 * - **successCodes** - HTTP status codes considered as successful. Default: `[]`.
 * - **retryCodes** - HTTP status codes that trigger a retry. Default: `[]`.
 * - **delayFactor** - Factor to calculate the exponential delay. Default: `1`.
 * - **delay** - Delay between retries in milliseconds, modified by `delayFactor`. Default: `0`.
 * - **maxDelay** - Maximum delay between retries in milliseconds. Default: `Infinity`.
 * - **onRequestFailure** - Callback for each failed request. Default: `({ url, params, response, retries, config }) => {}`.
 * - **onAllRequestsFailure** - Callback when all retries fail. Default: `({ url, params, response, retries, config }) => {}`.
 * @class
 */
class FetchApp {
  /**
   * Creates an instance of FetchApp.
   * @param {FetchAppConfig=} config FetchApp configuration object.
   * Supported options:
   * - **maxRetries** - Maximum number of retry attempts. Default: `0`.
   * - **successCodes** - HTTP status codes considered as successful. Default: `[]`.
   * - **retryCodes** - HTTP status codes that trigger a retry. Default: `[]`.
   * - **delayFactor** - Factor to calculate the exponential delay. Default: `1`.
   * - **delay** - Delay between retries in milliseconds, modified by `delayFactor`. Default: `0`.
   * - **maxDelay** - Maximum delay between retries in milliseconds. Default: `Infinity`.
   * - **onRequestFailure** - Callback for each failed request. Default: `({ url, params, response, retries, config }) => {}`.
   * - **onAllRequestsFailure** - Callback when all retries fail. Default: `({ url, params, response, retries, config }) => {}`.
   * @constructor
   */
  constructor(config = {}) {
    /**
     * FetchApp configuration object.
     * Supported options:
     * - **maxRetries** - Maximum number of retry attempts. Default: `0`.
     * - **successCodes** - HTTP status codes considered as successful. Default: `[]`.
     * - **retryCodes** - HTTP status codes that trigger a retry. Default: `[]`.
     * - **delayFactor** - Factor to calculate the exponential delay. Default: `1`.
     * - **delay** - Delay between retries in milliseconds, modified by `delayFactor`. Default: `0`.
     * - **maxDelay** - Maximum delay between retries in milliseconds. Default: `Infinity`.
     * - **onRequestFailure** - Callback for each failed request. Default: `({ url, params, response, retries, config }) => {}`.
     * - **onAllRequestsFailure** - Callback when all retries fail. Default: `({ url, params, response, retries, config }) => {}`.
     * @type {FetchAppConfig}
     * @public
     */
    this.config = config;
  }

  /**
   * Initiates an HTTP request using instance configuration.
   * @param {string} url The URL to fetch.
   * @param {FetchParams=} params Parameters for the request.
   * Supported options:
   * - **method** - The HTTP method for the request: 'get', 'delete', 'patch', 'post', or 'put'.
   * - **headers** - A map of headers for the request.
   * - **contentType** - The MIME type of the payload.
   * - **payload** - The payload (e.g., POST body) for the request.
   * - **muteHttpExceptions** - If true, the fetch will not throw an exception on failure.
   * - **validateHttpsCertificates** - If false, it will allow requests to sites with invalid certificates.
   * - **followRedirects** - If true, the fetch will follow HTTP redirects.
   * - **useIntranet** - If true, the fetch can access sites in the intranet.
   * - **escaping** - If false, it will not automatically escape the payload.
   * @param {FetchAppConfig=} config Additional config for the request.
   * Supported options:
   * - **maxRetries** - Maximum number of retry attempts. Default: `0`.
   * - **successCodes** - HTTP status codes considered as successful. Default: `[]`.
   * - **retryCodes** - HTTP status codes that trigger a retry. Default: `[]`.
   * - **delayFactor** - Factor to calculate the exponential delay. Default: `1`.
   * - **delay** - Delay between retries in milliseconds, modified by `delayFactor`. Default: `0`.
   * - **maxDelay** - Maximum delay between retries in milliseconds. Default: `Infinity`.
   * - **onRequestFailure** - Callback for each failed request. Default: `({ url, params, response, retries, config }) => {}`.
   * - **onAllRequestsFailure** - Callback when all retries fail. Default: `({ url, params, response, retries, config }) => {}`.
   * @returns {UrlFetchApp.HTTPResponse|null} The response object or null if all retries fail.
   */
  fetch(url, params = {}, config = {}) {
    return FetchApp.fetch(url, params, { ...this.config, ...config });
  }

  /**
   * Initiates an HTTP request using instance configuration.
   * @param {string} url The URL to fetch.
   * @param {FetchParams=} params Parameters for the request.
   * Supported options:
   * - **method** - The HTTP method for the request: 'get', 'delete', 'patch', 'post', or 'put'.
   * - **headers** - A map of headers for the request.
   * - **contentType** - The MIME type of the payload.
   * - **payload** - The payload (e.g., POST body) for the request.
   * - **muteHttpExceptions** - If true, the fetch will not throw an exception on failure.
   * - **validateHttpsCertificates** - If false, it will allow requests to sites with invalid certificates.
   * - **followRedirects** - If true, the fetch will follow HTTP redirects.
   * - **useIntranet** - If true, the fetch can access sites in the intranet.
   * - **escaping** - If false, it will not automatically escape the payload.
   * @param {FetchAppConfig=} config Additional config for the request.
   * Supported options:
   * - **maxRetries** - Maximum number of retry attempts. Default: `0`.
   * - **successCodes** - HTTP status codes considered as successful. Default: `[]`.
   * - **retryCodes** - HTTP status codes that trigger a retry. Default: `[]`.
   * - **delayFactor** - Factor to calculate the exponential delay. Default: `1`.
   * - **delay** - Delay between retries in milliseconds, modified by `delayFactor`. Default: `0`.
   * - **maxDelay** - Maximum delay between retries in milliseconds. Default: `Infinity`.
   * - **onRequestFailure** - Callback for each failed request. Default: `({ url, params, response, retries, config }) => {}`.
   * - **onAllRequestsFailure** - Callback when all retries fail. Default: `({ url, params, response, retries, config }) => {}`.
   * @returns {UrlFetchApp.HTTPResponse|null} The response object or null if all retries fail.
   */
  static fetch(url, params = {}, config = {}) {
    let retries = 0;
    let response;

    const configMerged = this._getConfig(config);

    // Mute HTTP exceptions, if the param is not set explicitly.
    // If it is set to `false`, the user is responsible for handling the exceptions
    // and the retry logic will not be work.
    const paramsMerged = {
      muteHttpExceptions: true,
      ...params,
    };

    while (true) {
      response = UrlFetchApp.fetch(url, paramsMerged);
      const responseCode = response.getResponseCode();

      if (
        configMerged.successCodes.includes(responseCode) ||
        (configMerged.successCodes.length === 0 &&
          !configMerged.retryCodes.includes(responseCode))
      ) {
        return response;
      }

      console.log(
        `Request failed for ${url} with response code ${responseCode}. Attempt ${
          retries + 1
        }`
      );
      configMerged.onRequestFailure({
        url,
        params: paramsMerged,
        response,
        retries,
        config: configMerged,
      });

      // If we're going to retry the request, add a linear or exponential delay, depending on the config
      if (retries < configMerged.maxRetries) {
        const delay = Math.min(
          Math.pow(configMerged.delayFactor, retries) * configMerged.delay,
          configMerged.maxDelay
        );
        Utilities.sleep(delay);
      } else {
        break;
      }

      retries++;
    }

    console.log(`Max retries reached for URL: ${url}`);
    configMerged.onAllRequestsFailure({
      url,
      params: paramsMerged,
      response,
      retries,
      config: configMerged,
    });
    return null;
  }

  static _getConfig(config = {}) {
    return {
      maxRetries: config.maxRetries || defaultConfig_.maxRetries,
      successCodes: config.successCodes || defaultConfig_.successCodes,
      retryCodes: config.retryCodes || defaultConfig_.retryCodes,
      delayFactor: config.delayFactor || defaultConfig_.delayFactor,
      delay: config.delay || defaultConfig_.delay,
      maxDelay: config.maxDelay || defaultConfig_.maxDelay,
      onRequestFailure:
        config.onRequestFailure || defaultConfig_.onRequestFailure,
      onAllRequestsFailure:
        config.onAllRequestsFailure || defaultConfig_.onAllRequestsFailure,
      ...config,
    };
  }
}

const defaultConfig_ = {
  maxRetries: 0,
  successCodes: [],
  retryCodes: [],
  delayFactor: 1,
  delay: 0,
  maxDelay: Infinity,
  onRequestFailure: ({ url, params, response, retries, config }) => {},
  onAllRequestsFailure: ({ url, params, response, retries, config }) => {},
};

// Export to allow unit testing
if (typeof module === "object") {
  module.exports = {
    fetch,
    getClient,
    FetchApp,
    defaultConfig_,
  };
}
