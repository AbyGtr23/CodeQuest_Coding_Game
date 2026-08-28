import { Press_Start_2P, JetBrains_Mono, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';
import Navbar from '@/components/Navbar/Navbar';

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata = {
  title: 'CodeQuest',
  description: 'Level up your code. Conquer the stack.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${pressStart2P.variable} ${jetBrainsMono.variable} ${inter.variable}`}>
      <body>
        <AuthProvider>
          <Navbar />
          <main className="container">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
