import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeuralScholar — Interactive Deep Learning Course",
  description:
    "Learn Deep Learning visually: Perceptrons, Backpropagation, CNNs, RNNs, LSTMs, GRUs, Autoencoders, VAEs, GANs and Boltzmann Machines through interactive visualizations. Based on CCE3144 (Manipal University Jaipur).",
  keywords: [
    "Deep Learning",
    "Interactive Learning",
    "CNN",
    "RNN",
    "LSTM",
    "GRU",
    "Autoencoder",
    "GAN",
    "CCE3144",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
