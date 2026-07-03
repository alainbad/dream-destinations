import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor configuration for the Dream Destinations native iOS app.
 *
 * The `server.url` points at the published Lovable web app so the iOS shell
 * always renders the latest deployed version — the same "web + Capacitor
 * wrapper" pattern used for Trackora.
 *
 * When you're ready to ship a fully offline / App Store build, remove the
 * `server` block, run `bun run build`, then `npx cap sync ios`.
 */
const config: CapacitorConfig = {
  appId: "com.dreamdestinations.app",
  appName: "Dream Destinations",
  webDir: "dist",
  server: {
    url: "https://id-preview--7959268b-1ab7-41dd-815d-6ebd9609ec44.lovable.app",
    cleartext: false,
  },
  ios: {
    contentInset: "always",
  },
};

export default config;
