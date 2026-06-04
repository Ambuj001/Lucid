import './globals.css';

export const metadata = {
  title: 'cardwise. — Premium Card Optimization',
  description: 'Ultra-premium Indian credit card reward yield optimization platform by Cardwise.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-black text-white antialiased grain-overlay">
        {children}
      </body>
    </html>
  );
}
