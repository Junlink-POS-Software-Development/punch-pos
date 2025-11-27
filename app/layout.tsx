import type { Metadata } from "next";
import { Geist, Geist_Mono, VT323 } from "next/font/google";
import "./globals.css";
import { ViewProvider } from "../components/window-layouts/ViewContext";
import MainWindow from "../components/window-layouts/MainWindow";
import { QueryProvider } from "@/context/QueryProvider";
import { SettingsProvider } from "@/context/SettingsContext";
import { ItemsProvider } from "./inventory/components/item-registration/context/ItemsContext";
import { Analytics } from "./components/Analytics";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

// Add VT323 for retro elements (used in receipt modal)
const vt323 = VT323({
  weight: '400',
  variable: '--font-vt323',
  subsets: ['latin'],
  display: 'swap',
  preload: false, // Only load when needed
});

export const metadata: Metadata = {
  title: "JunFue POS",
  description: "Next Gen Point of Sale",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${vt323.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <QueryProvider>
            <SettingsProvider>
              <ItemsProvider>
                <ViewProvider>
                  <MainWindow>{children}</MainWindow>
                </ViewProvider>
              </ItemsProvider>
            </SettingsProvider>
          </QueryProvider>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
