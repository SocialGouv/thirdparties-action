const fs = require("fs");
const core = require("@actions/core");

const scan = require("./scan");

async function run() {
  try {
    const url = core.getInput("url");
    const output = core.getInput("output");
    core.info(`Running scan on ${url} ...`);
    const results = await scan(url);
    fs.writeFileSync(output, JSON.stringify(results));
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
