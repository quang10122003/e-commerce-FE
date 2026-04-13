import type { Metadata } from "next";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "@/styles/globals.css";
import Providers from "./providers";
config.autoAddCss = false;

export const metadata: Metadata = {
  title: "MyShop",
  description: "MyShop ecommerce frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="h-full antialiased">
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

