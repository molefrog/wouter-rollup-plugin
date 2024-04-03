import { RollupOptions } from "rollup";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import wouterRoutes from "./plugin";

const config: RollupOptions = {
  input: "src/main.tsx",
  external: ["react", "react/jsx-runtime", "wouter", "wouter/use-hash-location"],
  output: [
    {
      file: "dist/bundle.js",
      format: "esm",
    },
  ],
  plugins: [typescript(), nodeResolve(), wouterRoutes()],
};

export default config;
