import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import localfont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Navbar } from "@/components/navbar";
import { MidenSdkProvider } from "@/providers/sdk-provider";
import { BackgroundProcesses } from "@/components/background-process";
import { BalanceProvider } from "@/providers/balance-provider";
import { TransactionProviderC } from "@/providers/transaction-provider";
import { Toaster } from "sonner";
import { WebRtcProvider } from "@/providers/webrtc-provider";
import { ReceiverProvider } from "@/providers/receiver-provider";
import { Footer } from "@/components/footer";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = Geist({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const giest = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const departureMono = localfont({
  src: "./DepartureMono-Regular.woff2",
  variable: "--font-departure-mono",
});

export const metadata: Metadata = {
  title: "Miden Web Wallet",
  description: "A web wallet for interacting with the Miden blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/miden_wallet_logo_centered.svg" />
      </head>
      <body
        className={`${inter.variable} ${mono.variable} ${giest.variable} ${departureMono.variable} antialiased min-h-screen flex flex-col bg-white bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:24px_24px]`}
      >
        <ThemeProvider defaultTheme="light">
          <MidenSdkProvider>
            <BalanceProvider>
              <TransactionProviderC>
                <WebRtcProvider>
                  <ReceiverProvider>
                    <BackgroundProcesses />
                    <Navbar />
                    <main className="flex-1">{children}</main>
                    <Footer />
                    <Toaster />
                  </ReceiverProvider>
                </WebRtcProvider>
              </TransactionProviderC>
            </BalanceProvider>
          </MidenSdkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
