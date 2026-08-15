import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Viara",
    short_name: "Viara",
    description:
      "Viara helps organizations transform complex maintenance workflows into clear digital operations.",
    id: "/tyo",
    start_url: "/tyo",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#dfe3e7",
    theme_color: "#dfe3e7",
    lang: "fi",
    categories: ["business", "productivity", "utilities"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
