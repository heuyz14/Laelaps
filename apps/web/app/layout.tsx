import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Laelaps",
  description: "Running analytics and AI training intelligence.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
