import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard Digital Kanwil Kemenag Lampung",
  description:
    "Dashboard data strategis, agenda eksekutif, publikasi, video, kontak, dan lokasi Kanwil Kemenag Provinsi Lampung.",
  icons: {
    icon: [
      {
        url: "/brand/logo-kanwil-kemenag-lampung-icon.png",
        type: "image/png",
        sizes: "212x212",
      },
      {
        url: "/favicon-32x32.png",
        type: "image/png",
        sizes: "32x32",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
