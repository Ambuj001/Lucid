import './globals.css';

export const metadata = {
  title: 'Lucid Dashboard',
  description: 'Premium Indian credit card optimization platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
