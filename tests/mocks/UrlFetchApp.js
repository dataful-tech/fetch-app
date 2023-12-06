const urlFetchAppMock = {
  fetch: jest.fn((url, params) => {
    return {
      getContentText: () => `Mock response for URL: ${url}`,
      getResponseCode: () => 200,
    };
  }),
};

module.exports = urlFetchAppMock;