import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import process from "process";

function inlineCssPlugin() {
  return {
    name: "inline-css",
    apply: "build",
    enforce: "post",
    transformIndexHtml(html, ctx) {
      if (!ctx || !ctx.bundle) return html;
      let newHtml = html;
      for (const [fileName, file] of Object.entries(ctx.bundle)) {
        if (fileName.endsWith(".css") && fileName.includes("index") && file.type === "asset") {
          const cssContent = typeof file.source === "string" ? file.source : file.source.toString();
          const escaped = fileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const regex = new RegExp(`<link[^>]*href=["'][^"']*${escaped}["'][^>]*>`, "i");
          if (regex.test(newHtml)) {
            newHtml = newHtml.replace(regex, `<style>${cssContent}</style>`);
            delete ctx.bundle[fileName];
          }
        }
      }
      return newHtml;
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      vue({
        template: {
          transformAssetUrls: {
            includeAbsolute: false,
          },
        },
      }),
      tailwindcss(),
      inlineCssPlugin(),
    ],
    server: {
      port: Number(env.APP_PORT) || 3000,
    },
    preview: {
      port: Number(env.APP_PORT) || 3000,
    },
    define: {
      DELCOM_BASEURL: JSON.stringify(
        env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1"
      ),
    },
    build: {
      target: "esnext",
      sourcemap: true,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("@toast-ui")) {
                return "toast-ui";
              }
              if (id.includes("sweetalert2")) {
                return "sweetalert2";
              }
              if (id.includes("lucide-vue-next")) {
                return "lucide";
              }
            }
          },
        },
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.js",
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        include: ["src/**/*.{js,vue}"],
        exclude: [
          "src/main.js",
          "src/setupTests.js",
          "src/test-utils.js",
          "**/*.test.{js,jsx}",
          "node_modules/**",
          ".docs/**",
        ],
        thresholds: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  };
});
