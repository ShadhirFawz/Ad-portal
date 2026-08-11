import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Marketplace | Ad Portal",
  description: "Modern peer-to-peer ad marketplace platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 dark:bg-[#0b0f19] dark:text-slate-100 min-h-screen flex flex-col selection:bg-emerald-500 selection:text-white">
        <AuthProvider>
          <Navbar />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}