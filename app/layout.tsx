import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Romantic Dinings",
  description: "Romantic Dinings",
};

export default function RootLayout ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          async
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="226b3a86-f8eb-4e35-94ad-e7ccc671931c"
        />
      </head>
      <body
        className={`${GeistSans.className} ${GeistMono.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
