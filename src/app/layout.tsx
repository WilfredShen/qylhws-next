import React from "react";

import { Metadata } from "next";
import { Inter } from "next/font/google";

import WithTheme from "@/theme";
import { AntdRegistry } from "@ant-design/nextjs-registry";

import "@/styles/index.scss";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "柒月流火WS",
  description: "柒月流火WS的个人网站",
};

export interface RootLayoutProps {
  children?: React.ReactNode;
}

const RootLayout = (props: RootLayoutProps) => {
  const { children } = props;

  return (
    <html lang="zh-CN">
      <head>
        <script defer src="/scripts/scroll.js" />
      </head>
      <body className={inter.className}>
        <AntdRegistry>
          <WithTheme>{children}</WithTheme>
        </AntdRegistry>
      </body>
    </html>
  );
};

export default RootLayout;
