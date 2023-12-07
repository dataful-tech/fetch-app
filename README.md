# FetchApp

FetchApp extends the functionality of the built-in UrlFetchApp in Google Apps Script with advanced features like:

1. **Optional Retries:** Depending on the response code received.
2. **Delay Strategies:** Choose between linear or exponential delay between retries.
3. **Custom Callbacks:** Implement callbacks on failed attempts for tailored actions and logic.
4. **Enhanced Type Hints:** Improved hints for UrlFetchApp's `params` argument.
5. **Automatic Logging:** Logs failed attempts automatically.

FetchApp is a [Dataful.Tech](https://dataful.tech) project.

## Setup

You can set up FetchApp in two ways:

1. **Copy the code** from `src/FetchApp.js` to your project. In addition to having control over the code and being able to modify it, you will also get better type hints (see section Type Hints and Autocomplete below).
2. **Connect as a library**: use the library id `1-U70HU_cxKSdTe4U6leREd4wlA7Wey5zOPE5eDF38WgBPrOoi-cztxlb`.

## Usage

There are two ways to use FetchApp.

### Drop-in Replacement for UrlFetchApp

Replace `UrlFetchApp` with `FetchApp` directly. **Note:** By default, FetchApp sets `muteHttpExceptions: true` in `params` unless explicitly specified otherwise.

```js
// `url` and `params` are defined elsewhere

// regular UrlFetchApp
const response1 = UrlFetchApp.fetch(url, params);

// FetchApp without configuration is a pass-through to UrlFetchApp
const response2 = FetchApp.fetch(url, params);

// FetchApp with retries and delay enabled
const config = {
  maxRetries: 5,
  successCodes: [200],
  delay: 500,
};
const response3 = FetchApp.fetch(url, params, config);

// If there are no `params`, pass an empty object
const response4 = FetchApp.fetch(url, {}, config);
```

### Configurable Client

If you need to use FetchApp multiple times, you can initiate a client to reuse the configuration:

```js
// FetchApp with retries and delay enabled
const config = {
  maxRetries: 5,
  retryCodes: [500, 502, 503, 504],
  delay: 500,
};

const client = FetchApp.getClient(config);

// All client's fetch calls will use this config
const response1 = client.fetch(url, params);

// Partially modify the config for a specific request
const response2 = client.fetch(url, params, { successCodes: [200] });
```

## Configuration

FetchApp offers a variety of customizable configuration options to fine-tune its behavior:

1. Retries:
   - `maxRetries`: Defines the maximum number of retry attempts. Type: Number. Default: `0`. The total number of requests can be up to `maxRetries` + 1, including the original request.
   - `successCodes`: Specifies response codes that indicate a successful response, halting further retries. Type: Array of numbers. Default: `[]`. _Note:_ When set, `retryCodes` are disregarded.
   - `retryCodes`: Lists response codes that trigger a retry, suggesting the initial request failed. Type: Array of numbers. Default: `[]`.
2. Delays between retries:
   - `delay`: Sets the waiting period between retries in milliseconds. Type: Number. Default: `0` (immediate retry).
   - `delayFactor`: Determines the exponential increase in delay. Type: Number. Default: `1` (constant delay). Delay is calculated as delay multiplied by delayFactor raised to the power of the retry attempt number. _Example:_ With a delay of 1000ms and delayFactor of 2, delays would be 1, 2, 4, 8, 16 seconds, and so on.
   - `maxDelay`: Caps the maximum delay in milliseconds. Type: Number. Default: `Infinity`. This cap prevents excessively long delays.
3. Callbacks:
   - `onRequestFailure`: Invoked upon a request failure. Type: Function. Default: No action. This function receives an object containing the FetchApp context, including the request's **url** and **params**, the **response**, the FetchApp **config** for the request, and the number of **retries**.
   - `onAllRequestsFailure`: Triggered when all attempts to make a request fail. Type: Function. Default: No action. It receives the same context as `onRequestFailure`, with the **response** being the last failed attempt.

## Limitations

FetchApp sets `params.muteHttpExceptions: true` unless it is explicitly specified otherwise. If you need to throw an exception, for example, on certain response codes, you can do it via callbacks:

```js
// Throw an exception on 401 or 403 response codes
const stopRequests = ({ url, response }) => {
  const responseCode = response.getResponseCode();
  if ([401, 403].includes(responseCode)) {
    throw new Error(`Received ${responseCode} when accessing ${url}`);
  }
};

const config = {
  successCodes: [200],
  maxRetries: 5,
  delay: 500,
  onRequestFailure: stopRequests,
};

const response = FetchApp.fetch(url, params, config);
```

## Type Hints and Autocomplete

FetchApp leverages Google Apps Script IDE's limited JSDoc annotations support. If you copy the full code of the library, you will get complete type hints and autocomplete for all variables, including `params` and `config`.

<div align="center">
  <img class="logo" src="https://github.com/dataful-tech/fetch-app/raw/main/images/params-options-autocomplete.png" width="600px" alt="FetchApp | Autocomplete for params options"/>
</div>

Unfortunately, the IDE does not recognize most JSDoc annotations from the libraries, and only text description of the fields is visible. All options are also duplicated in the field descriptions to mitigate this limitation and for easier reference.

<div align="center">
  <img class="logo" src="https://github.com/dataful-tech/fetch-app/raw/main/images/params-options-autocomplete.png" width="600px" alt="FetchApp | Hint for params options"/>
</div>

## Versioning

This project follows standard `MAJOR.MINOR.PATCH` semantic versioning. Breaking changes may be introduced in new major versions.

## License

FetchApp is available under the MIT license.

## Contribution

Contributions are welcome. Feel free to submit PRs or issues on GitHub for any suggestions or issues.
