import type { Metadata } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GasEntregas",
    template: "%s | GasEntregas",
  },
  description: "Sistema de controle de vendas e entregas de gás.",
  applicationName: "GasEntregas",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "GasEntregas",
    description: "Sistema de controle de vendas e entregas de gás.",
    url: siteUrl,
    siteName: "GasEntregas",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "GasEntregas",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GasEntregas",
    description: "Sistema de controle de vendas e entregas de gás.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}