import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PrivyProvider from "@/components/PrivyProvider";
import { LoginModalProvider } from "@/contexts/LoginModalContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Trends.fun",
  description: "Discover crypto culture in real time",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <PrivyProvider>
          <LoginModalProvider>
            {children}
          </LoginModalProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}
