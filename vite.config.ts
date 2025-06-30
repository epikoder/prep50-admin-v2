import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import vike from "vike/plugin";
import { fileURLToPath, URL } from "url";

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
    ssr: {
        noExternal: ["valync"],
    },
    resolve: {
        alias: [
            {
                find: "@assets",
                replacement: fileURLToPath(
                    new URL("./assets", import.meta.url),
                ),
            },
            {
                find: "@components",
                replacement: fileURLToPath(
                    new URL("./components", import.meta.url),
                ),
            },
            {
                find: "@pages",
                replacement: fileURLToPath(new URL("./pages", import.meta.url)),
            },
            {
                find: "@src",
                replacement: fileURLToPath(new URL("./src", import.meta.url)),
            },
        ],
    },
});
