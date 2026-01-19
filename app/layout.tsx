import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google' // Using a tech-focused font
import './globals.css'
import { cn } from '@/lib/utils'

const fontHeading = Outfit({ subsets: ['latin'], variable: '--font-heading' })
const fontBody = Inter({ subsets: ['latin'], variable: '--font-body' })

export const metadata: Metadata = {
    title: 'Reason3 | Advanced Claim Intelligence',
    description: 'Multimodal claim verification powered by Gemini 3',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body className={cn(
                "min-h-screen font-sans antialiased selection:bg-primary/20",
                fontHeading.variable,
                fontBody.variable
            )} suppressHydrationWarning>
                <main className="relative flex min-h-screen flex-col overflow-hidden">
                    <div className="flex-1">
                        {children}
                    </div>
                    {/* Background ambient glow */}
                    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
                        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[100px]" />
                        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[100px]" />
                    </div>
                </main>
            </body>
        </html>
    )
}
