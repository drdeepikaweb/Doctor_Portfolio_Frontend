import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dr. Deepika Bhardwaj Clinic",
    short_name: "Dr. Deepika",
    description: "Book appointments and online consultations with Dr. Deepika Bhardwaj.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0e7490",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
