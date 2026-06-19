import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Covenant: Legacies | The Valley of the Giant",
  description:
    "A biblical supernatural roguelike deckbuilding card battler. The Valley of the Giant is David's beginner starter campaign, anchored in 1 Samuel 17.",
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
