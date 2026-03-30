import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    tailwindcss(),
    metaImagesPlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  optimizeDeps: {
    entries: [],
    include: [
      "react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime",
      "wouter", "@tanstack/react-query",
      "lucide-react", "framer-motion", "sonner", "recharts",
      "class-variance-authority", "clsx", "tailwind-merge",
      "react-hook-form", "@hookform/resolvers/zod",
      "zod", "date-fns", "embla-carousel-react", "cmdk", "vaul", "input-otp",
      "use-sync-external-store/shim", "use-sync-external-store/shim/with-selector",
      "@radix-ui/react-dialog", "@radix-ui/react-alert-dialog",
      "@radix-ui/react-select", "@radix-ui/react-tabs", "@radix-ui/react-toast",
      "@radix-ui/react-tooltip", "@radix-ui/react-accordion", "@radix-ui/react-checkbox",
      "@radix-ui/react-label", "@radix-ui/react-slot", "@radix-ui/react-separator",
      "@radix-ui/react-scroll-area", "@radix-ui/react-popover", "@radix-ui/react-switch",
      "@radix-ui/react-dropdown-menu", "@radix-ui/react-radio-group",
      "@radix-ui/react-progress", "@radix-ui/react-toggle", "@radix-ui/react-toggle-group",
      "react-resizable-panels", "next-themes", "react-day-picker",
    ],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
