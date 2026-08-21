import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const SITE_DESCRIPTION = "공공임대 주택을 지도에서 미리, 편하게 찾는 서비스";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host")
    ?? requestHeaders.get("host")
    ?? "localhost:3000";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0];
  const protocol = forwardedProtocol ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const socialImage = new URL("/og.png", origin).toString();

  return {
    metadataBase: new URL(origin),
    title: {
      default: "두꺼비집",
      template: "%s | 두꺼비집",
    },
    description: SITE_DESCRIPTION,
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: "두꺼비집",
      title: "두꺼비집 — 공공임대, 지도에서 미리 찾다",
      description: SITE_DESCRIPTION,
      images: [{ url: socialImage, width: 1200, height: 630, alt: "두꺼비집 공공임대 지도 탐색 화면" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "두꺼비집 — 공공임대, 지도에서 미리 찾다",
      description: SITE_DESCRIPTION,
      images: [socialImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
