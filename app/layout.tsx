import type { Metadata } from "next";
import { Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "@/styles/globals.css";
import Providers from "./providers";
import { serverPrivateFetch } from "@/server/backend-fetch";
import { getServerSession } from "@/server/auth-session";
import type { CurrentUserResponse } from "@/types/Auth/CurrentUserResponse";
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

async function getInitialSessionUser() {
  const session = await getServerSession();
  const hasSessionCookie = Boolean(session.accessToken || session.refreshToken);

  if (!hasSessionCookie) {
    return {
      hasSessionCookie,
      initialUser: null,
    };
  }

  try {
    const response = await serverPrivateFetch<CurrentUserResponse>("/auth/me");

    return {
      hasSessionCookie,
      initialUser: response.data,
    };
  } catch {
    return {
      hasSessionCookie,
      initialUser: null,
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { hasSessionCookie, initialUser } = await getInitialSessionUser();

  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      className={`${appSans.variable} ${appMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-background text-foreground">
        <Providers hasSessionCookie={hasSessionCookie} initialUser={initialUser}>
          {children}
        </Providers>
      </body>
    </html>
  );
}

