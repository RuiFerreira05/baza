import { defineConfig } from "tsup";

// This file is responsible for configuring tsup, which is a bundler for TypeScript projects (the
// thing that turns typescript files into javascript files). We are using tsup because, when we move
// away from development and go into production, we want to have a project that is actually capable
// of being run by node without needing to use tsx.

export default defineConfig({
  // The entry point of the server, so tsup knows where to start bundling.
  entry: ["src/server.ts"],
  // The format of the output files. We are using ESM (ECMAScript Modules) because it is the modern
  // standard for JavaScript modules, and it allows us to use the import/export syntax.
  format: ["esm"],
  // cleans the output directory before each build.
  clean: true,
  target: "es2022",
  // The target environment for the output code. We are targeting node because this code will be run
  // on a server, not in a browser.
  platform: "node",
  // this essentially tells tsup taht these files are local and should be bundled together with the
  // rest of the code.
  noExternal: ["@baza/shared-types", "@baza/db", "@baza/db/schemas"],
  // this tells tsup that pg is an external dependency and should not be bundled with the rest of
  // the code. (This is here cause pg is imported by one of our packages, i dont remember which, and
  // therefore would be bundled with the rest of the code. which would cause problems cause it
  // uses commonjs and we use esm)
  external: ["pg"],
});
