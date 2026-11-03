import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "康高特 AIGC 数字营销平台",
  description: "北京康高特仪器设备有限公司内部 AIGC 产品彩页生产平台",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
