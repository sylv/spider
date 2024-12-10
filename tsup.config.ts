import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/transforms/*.ts"],
  platform: "node",
  target: "node22",
  format: ["esm"],
  clean: true,
  minify: false,
  sourcemap: true,
  splitting: true,
  treeshake: true,
  dts: true,
  define: {
    "import.meta.vitest": "undefined",
  },
});
