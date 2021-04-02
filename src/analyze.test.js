const { belongsToSameDomain } = require("./analyze");

describe("belongsToSameDomain", () => {
  const isValid = [
    ["https://www.a.com/hello", "http://www.a.com/hello2"],
    ["https://xxx.www.a.com/hello", "http://www.a.com/hello2"],
  ];
  const isInvalid = [
    ["https://www.a.com/hello", "http://www.a.com.c.com/hello2"],
    ["https://www.b.com", "http://www.a.com"],
  ];
  isValid.forEach(([url1, url2]) => {
    test(`${url1} = ${url2}`, () =>
      expect(belongsToSameDomain(url1, url2)).toEqual(true));
  });
  isInvalid.forEach(([url1, url2]) => {
    test(`${url1} != ${url2}`, () =>
      expect(belongsToSameDomain(url1, url2)).toEqual(false));
  });
});
