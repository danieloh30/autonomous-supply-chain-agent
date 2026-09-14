import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    // Let jsdom provide browser storage on Node 25+, where native storage shadows it.
    // https://github.com/vitest-dev/vitest/issues/10867
    execArgv:
      Number(process.versions.node.split(".")[0]) >= 25 ? ["--no-webstorage"] : [],
    setupFiles: ["./src/test/setup.ts"],
    restoreMocks: true,
  },
});
