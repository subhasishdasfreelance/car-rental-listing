import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { Inter } from "next/font/google";
import { NavProvider } from "@/ui/NavProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main
      className={`${inter.className} ${inter.className} font-sans antialiased`}
    >
      <NavProvider>
        <Component {...pageProps} />
      </NavProvider>
    </main>
  );
}
