import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/bin.ts", "src/bin/fopen-handler.ts"],
  clean: true,
  publicDir: true,
  treeshake: "smallest",
  external: ["@parcel/watcher"]
})
