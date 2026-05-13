import type { Metadata } from "next";
import { Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "@/styles/globals.css";
import Providers from "./providers";
config.autoAddCss = false;

const appSans = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--app-font-sans",
  weight: ["400", "500", "600", "700"],
});

const appMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--app-font-mono",
  weight: ["400", "500", "600", "700"],
});

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
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      className={`${appSans.variable} ${appMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

