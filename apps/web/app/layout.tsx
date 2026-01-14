import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Medwait | Ontario ED Wait-Times',
  description: 'Real-time Emergency Department wait times and intelligent routing for Ontario.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="main-gradient-bg"></div>
        <nav className="navbar glass-card">
          <div className="nav-container">
            <h1 className="logo">Medwait</h1>
            <div className="disclaimer-mini">
              If life-threatening, call 911 immediately.
            </div>
          </div>
        </nav>
        {children}
        <style dangerouslySetInnerHTML={{
          __html: `
          .main-gradient-bg {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: -1;
            background: 
              radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 40%),
              radial-gradient(circle at 80% 80%, rgba(245, 158, 11, 0.03) 0%, transparent 40%),
              #0a0a0c;
          }
          .navbar {
            margin: 20px;
            padding: 16px 32px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .nav-container {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            max-width: 1200px;
            margin: 0 auto;
          }
          .logo {
            font-size: 1.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #fff 0%, #8b5cf6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .disclaimer-mini {
            font-size: 0.8rem;
            color: var(--error);
            font-weight: 500;
          }
        `}} />
      </body>
    </html>
  )
}
