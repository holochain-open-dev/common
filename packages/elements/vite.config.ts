// vite.config.js
import checker from "vite-plugin-checker";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const pkg = require("./package.json");

export default defineConfig({
  server: {
    open: "/demo/index.html",
  },
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
    checker({ typescript: true }),
  ], // e.g. use TypeScript check
  build: {
    lib: {
      entry: "./src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [...Object.keys(pkg.dependencies), /lit/, /@shoelace-style/],
    },
  },
});
