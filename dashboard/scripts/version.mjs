import { execSync } from "node:child_process";

function getVersion() {
  const fromEnv = process.env.APP_VERSION;
  if (fromEnv) return fromEnv;
  try {
    const messages = execSync("git log --reverse --format=%s", {
      encoding: "utf8",
    })
      .trim()
      .split("\n")
      .filter(Boolean);
    const isComplex = (msg) => /^(feat|perf)(\(.+\))?:/.test(msg);
    let minor = 0;
    let patch = 0;
    messages.slice(1).forEach((msg) => {
      if (isComplex(msg)) {
        minor += 1;
        patch = 0;
      } else {
        patch += 1;
      }
    });
    return `1.${minor}.${patch}`;
  } catch {
    return "1.0.0";
  }
}

console.log(getVersion());
