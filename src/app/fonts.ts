import localFont from "next/font/local";

export const monumentNormal = localFont({
  src: [
    {
      path: "./fonts/PPMonumentNormal-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-monument-normal",
});

export const monumentWide = localFont({
  src: [
    {
      path: "./fonts/PPMonumentWide-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-monument-wide",
});

export const monumentBlack = localFont({
  src: [
    {
      path: "./fonts/PPMonumentWide-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-monument-black",
});
