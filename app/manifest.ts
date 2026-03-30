import type { MetadataRoute } from "next";

/** プライマリ（オレンジ）に合わせたツールバー色 */
const THEME = "#ea580c";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "シフト作成・閲覧アプリ",
    short_name: "シフト",
    description: "表入力とカレンダー表示に特化したシフト管理アプリ",
    lang: "ja",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#ffffff",
    theme_color: THEME,
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
