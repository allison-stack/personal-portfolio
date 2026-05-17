import { DM_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-dm-mono",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata = {
  title: "Allison Zhao — operator console",
  description:
    "Personal site of Allison Zhao. CS @ McMaster, Cloud Database Engineer Intern at Huawei. Ask me anything.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmMono.variable} ${instrumentSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
