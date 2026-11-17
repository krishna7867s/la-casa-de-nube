import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'La Casita de Nube · Nube de Fresa',
  description:
    'Portal interno de consulta de políticas de RRHH con RAG multiagente para el estudio Nube de Fresa (Costa Rica).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CR">
      <body className="agenda-grid-bg min-h-screen text-nube-texto antialiased selection:bg-nube-rosa selection:text-nube-ciruela">
        {children}
      </body>
    </html>
  );
}

