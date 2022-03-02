const dns = require("dns");
const puppeteer = require("puppeteer");
const pAll = require("p-all");
const uniq = require("lodash.uniq");
const splittedUrl = require("splitted-url");

const { analyzeUrl } = require("./analyze");
const { getGeoIP } = require("./geoip");

/**
 * Run a hostname to IP lookup
 *
 * @param {string} url The full URL
 *
 * @returns {Promise<DnsScanResult>}
 */
const dnsLookup = (url) =>
  new Promise((resolve, reject) => {
    dns.lookup(url, (err, result) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(result);
      }
    });
  });

/**
 * Run a third-parties lookup on some URL with puppeteer
 *
 * @param {string} url The full URL
 *
 * @returns {Promise<ThirdPartiesScanResult>}
 */
const scan = (url) =>
  puppeteer
    .launch({
      ignoreHTTPSErrors: true,
    })
    .then((browser) =>
      analyzeUrl(browser, url)
        .then((result) => {
          browser.close();
          return result;
        })
        .catch((e) => {
          browser.close();
          throw e;
        })
    )
    .then(async (results) => {
      if (!results.trackers) {
        return results;
      }
      const hostnames = uniq([
        splittedUrl(url).host,
        ...results.trackers.map((tracker) => splittedUrl(tracker.url).host),
      ]);

      const endpoints = await pAll(
        hostnames.map((hostname) => async () => {
          let ip = null;
          try {
            ip = await dnsLookup(hostname);
          } catch (e) {
            console.error("dnsLookup.error", e);
          }
          return {
            hostname,
            ip,
            // add geolite2 data
            geoip: ip && (await getGeoIP(ip)),
            // todo: add hosting info
          };
        }),
        { concurrency: 1 }
      );

      return {
        ...results,
        endpoints,
      };
    })
    .catch((e) => {
      console.error("e", e);
      return {
        trackers: null,
        cookies: null,
        headers: null,
        endpoints: null,
      };
    });

if (require.main === module) {
  const url = process.argv[process.argv.length - 1];
  scan(url)
    .then((results) => {
      console.log(JSON.stringify(results));
    })
    .catch(console.log);
}

module.exports = scan;
