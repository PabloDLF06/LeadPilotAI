import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "LeadPilot AI", template: "%s | LeadPilot AI" },
  description: "Plataforma SaaS de cualificación y seguimiento de leads con IA.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: { title: "LeadPilot AI", description: "Convierte cada formulario en una oportunidad atendida, clasificada y seguida.", type: "website" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
