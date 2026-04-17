import type { Metadata } from "next";
import { Archivo_Black, Space_Grotesk } from "next/font/google";
import { ConditionalHeader } from "@/components/navigation/ConditionalHeader";
import "./globals.css";

const headingFont = Archivo_Black({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const bodyFont = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Freelancer OS — Run Client Work Without The Chaos",
  description: "The punk operating system for independent professionals. Leads, contracts, signatures, updates, expenses — all in one loud place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ConditionalHeader />
        {children}
      </body>
    </html>
  );
}
