import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "sonner";

const poppinsMedium = localFont({
  src: "../public/fonts/Poppins-Medium.ttf",
  variable: "--font-poppins-medium",
  weight: "500",
});

const poppinsThin = localFont({
  src: "../public/fonts/Poppins-Thin.ttf",
  variable: "--font-poppins-thin",
  weight: "100",
});

export const metadata: Metadata = {
  title: "PayTo",
  description: "Sistema de gestión de workspaces empresariales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppinsMedium.variable} ${poppinsThin.variable} font-sans antialiased`}
      >
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
