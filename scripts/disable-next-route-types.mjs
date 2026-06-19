import { readFileSync, writeFileSync } from "node:fs";

const nextEnvPath = new URL("../next-env.d.ts", import.meta.url);
const contents = readFileSync(nextEnvPath, "utf8");
const withoutRouteTypes = contents.replace(
  /^import "\.\/\.next\/(?:dev\/)?types\/routes\.d\.ts";\r?\n/m,
  "",
);

if (withoutRouteTypes !== contents) {
  writeFileSync(nextEnvPath, withoutRouteTypes);
}
