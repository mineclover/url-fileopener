import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["./test/**/*.test.{js,mjs,cjs}", "./tests/**/*.test.{js,mjs,cjs}"],
    exclude: [],
    globals: true,
    coverage: {
      provider: "v8",
    },
  },
});