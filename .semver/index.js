const { readdirSync, readFileSync } = require("fs");

const path = require("path");

const semverCompare = require("semver-compare");
const packageJson = JSON.parse(
  readFileSync(path.join(__dirname, "../package.json"))
);
console.log(
  "analysing version:",
  process.argv[2],
  " greater than:",
  packageJson.version
);
const compared = semverCompare(process.argv[2], packageJson.version);

console.log("compared", compared);
console.log("exit code", compared > 0 ? 0 : 1);
process.exit(compared > 0 ? 0 : 1);
