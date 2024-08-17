import "@/styles/index.scss";

import React, { PropsWithChildren } from "react";

import { Metadata } from "next";
import { Inter } from "next/font/google";

import WithTheme from "@/theme";
import { AntdRegistry } from "@ant-design/nextjs-registry";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "柒月流火WS",
  description: "柒月流火WS的个人网站",
};

const RootLayout = (props: PropsWithChildren) => {
  const { children } = props;

  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <AntdRegistry>
          <WithTheme>{children}</WithTheme>
        </AntdRegistry>
      </body>
    </html>
  );
};

export default RootLayout;
