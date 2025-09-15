import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/bin-simple.js", "src/bin/fopen-handler-simple.js"],
  clean: true,
  publicDir: true,
  treeshake: "smallest",
  external: ["@parcel/watcher"],
  format: ["cjs"],
  outDir: "dist",
  outExtension: () => ({ js: ".cjs" })
})
