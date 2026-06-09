import { Poppins } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "ISHAMART - Your One Stop Shop | Electronics, Clothes, Shoes & More",
  description: "ISHAMART is your local Indian marketplace for Electronics, Clothes, Shoes & Slippers, Solar Panels, Medicine, Pathology Services and more. Best prices, fast delivery, quality products.",
  keywords: "ishamart, online shopping, electronics, clothes, shoes, solar panels, medicine, pathology, lucknow",
  openGraph: {
    title: "ISHAMART - Your One Stop Shop",
    description: "Shop Everything Online - Electronics, Clothes, Shoes, Solar Panels & More",
    type: "website",
  },
  verification: {
    google: "vu1VP_uDktuvpgLZZk9lloDVZ1K4WQcKsie4kRC-MBk",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} h-full`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className="min-h-full flex flex-col antialiased"
        style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
