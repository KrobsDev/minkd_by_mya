import type { Metadata } from "next";
import { Dancing_Script, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.minkdbymya.com";
const socialImage = "/images/logo.PNG";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Mink'd by Mya",
  description: "Luxury lash and beauty appointments with Mink'd by Mya.",
  openGraph: {
    title: "Mink'd by Mya",
    description: "Luxury lash and beauty appointments with Mink'd by Mya.",
    url: appUrl,
    siteName: "Mink'd by Mya",
    type: "website",
    images: [
      {
        url: socialImage,
        width: 1631,
        height: 1155,
        alt: "Mink'd by Mya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mink'd by Mya",
    description: "Luxury lash and beauty appointments with Mink'd by Mya.",
    images: [socialImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}
          ${dancingScript.variable} antialiased`}
      >
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
