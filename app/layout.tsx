import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
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

const geistSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          defaultTheme="system"
        >
          <MidenSdkProvider>
            <BalanceProvider>
              <TransactionProviderC>
                <WebRtcProvider>
                  <ReceiverProvider>
                    <BackgroundProcesses />
                    <Navbar />
                    {children}
                    <Toaster />
                  </ReceiverProvider>
                </WebRtcProvider>
              </TransactionProviderC>
            </BalanceProvider>
          </MidenSdkProvider>
        </ThemeProvider>
      </body>
    </html >
  );
}
