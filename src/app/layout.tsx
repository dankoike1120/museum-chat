import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Museum Chat - 展示物と会話しよう",
  description: "博物館の展示物を撮影して、AIと会話できるサービス",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
