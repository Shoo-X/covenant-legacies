import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Covenant: Legacies | War of the Watchers",
  description:
    "A biblical supernatural roguelike deckbuilding card battler. War of the Watchers is the first playable saga, and The Valley of the Giant is the first campaign map.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div id="app-root">{children}</div>
      </body>
    </html>
  );
}
