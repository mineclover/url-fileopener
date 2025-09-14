import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    "cli": "src/cli.ts",
    "bin/url-handler": "src/bin/url-handler.ts"
  },
  format: ["esm"],
  clean: true,
  publicDir: true,
  treeshake: "smallest",
  external: ["@parcel/watcher"],
  banner: {
    js: "#!/usr/bin/env node"
  },
  platform: "node",
  target: "node18",
  splitting: false,
  bundle: true
})
