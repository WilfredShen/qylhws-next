import "@/styles/index.scss";

import { Inter } from "next/font/google";

import { Metadata } from "next";
import { FC, PropsWithChildren } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import WithTheme from "@/theme";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "柒月流火WS",
  description: "柒月流火WS的个人网站",
};

const RootLayout: FC<PropsWithChildren> = ({ children }) => {
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
