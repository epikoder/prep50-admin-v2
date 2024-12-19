import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import vike from "vike/plugin";

let pgrestURL = process.env.PG_REST ?? "http://localhost:3001";

export default defineConfig({
  plugins: [vike({}), react({})],
  server: {
    proxy: {
      "/rest": {
        target: pgrestURL,
        rewrite: (path) => path.replace("/rest", ""),
      },
    },
  },
});
