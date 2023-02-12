import { defineConfig } from "tsup";

export default defineConfig({
  platform: "node",
  format: ["esm", "cjs"],
  target: "es2022",
  clean: true,
  minify: false,
  sourcemap: true,
  dts: true,
});
