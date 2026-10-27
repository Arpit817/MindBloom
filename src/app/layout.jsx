import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata = {
  title: {
    default: "MindBloom — Spaced Repetition & Active Recall",
    template: "%s | MindBloom",
  },
  description:
    "MindBloom helps students revise smarter using spaced repetition, active recall, structured notes, and day-wise learning plans.",
  keywords: [
    "spaced repetition",
    "active recall",
    "student notes",
    "revision",
    "flashcards",
    "learning",
    "study planner",
  ],
  authors: [{ name: "Arpit Anand Patel" }],
  creator: "Arpit Anand Patel",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "MindBloom — Spaced Repetition & Active Recall",
    description:
      "Revise smarter with spaced repetition, active recall, and day-wise study plans.",
    siteName: "MindBloom",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable}`}
    >
      <body className="min-h-dvh bg-[var(--bg)] text-[var(--foreground)] antialiased">
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
