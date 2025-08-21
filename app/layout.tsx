import type React from "react"
import type { Metadata } from "next"
import { Geist, Manrope } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
})

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
})

export const metadata: Metadata = {
  title: "FredGPT – First Uncensored AI",
  description: "FredGPT is the first uncensored AI that helps you generate powerful prompts and viral video ideas.",
  generator: "v0.dev",
  metadataBase: new URL("https://fredgpt.fun"),
  openGraph: {
    title: "FredGPT – First Uncensored AI",
    description: "FredGPT is the first uncensored AI that helps you generate powerful prompts and viral video ideas.",
    url: "https://fredgpt.fun",
    siteName: "FredGPT",
    images: [
      {
        url: "/imagine-gpt-logo.png",
        width: 500,
        height: 500,
        alt: "FredGPT Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FredGPT – First Uncensored AI",
    description: "FredGPT is the first uncensored AI that helps you generate powerful prompts and viral video ideas.",
    images: ["/imagine-gpt-logo.png"],
  },
  icons: {
    icon: "/imagine-gpt-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${manrope.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
