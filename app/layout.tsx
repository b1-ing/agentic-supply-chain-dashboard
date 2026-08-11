import "./globals.css";

export const metadata = {
  title: "Supply Chain Control Tower",
  description: "Agentic supply chain operations dashboard"
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}