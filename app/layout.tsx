import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/providers/theme-provider"
import { ConvexClientProvider } from "@/components/providers/convex-provider"
import { ModalProvider } from "@/components/providers/modal-provide";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Notefy",
  description: "Supercharge your notes",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)", 
        url: "/logo.svg",
        href: "/logo.svg"
      },
      {
        media: "(prefers-color-scheme: dark)", 
        url: "/logo-dark.svg",
        href: "/logo-dark.svg"
      }
    ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ConvexClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="notefy-theme"
          >
            <Toaster  position="bottom-center" />
            <ModalProvider />
            {children}
          </ThemeProvider>          
        </ConvexClientProvider>
      </body>
    </html>
  )
}
