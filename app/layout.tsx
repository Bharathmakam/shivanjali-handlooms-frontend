import type { Metadata } from "next";
import { Playfair_Display, Open_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ToastProvider } from "@/context/ToastContext";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Shivanjali Handlooms | Authentic Traditional Weaves",
    template: "%s | Shivanjali Handlooms",
  },
  description: "Explore the finest handloom sarees including Gadwal and Pochampally Ikat.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Shivanjali Handlooms",
    title: "Shivanjali Handlooms | Authentic Traditional Weaves",
    description: "Explore the finest handloom sarees including Gadwal and Pochampally Ikat.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shivanjali Handlooms | Authentic Traditional Weaves",
    description: "Explore the finest handloom sarees including Gadwal and Pochampally Ikat.",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${openSans.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                <Navbar />
                <main>{children}</main>
                <Footer />
                <WhatsAppButton />
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

