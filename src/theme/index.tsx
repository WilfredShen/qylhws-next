import { ConfigProvider } from "antd";
import React, { FC, PropsWithChildren } from "react";

const WithTheme: FC<PropsWithChildren> = ({ children }) => (
  <ConfigProvider
    theme={{
      cssVar: true,
      hashed: false,
      token: {
        fontSize: 16,
        colorPrimary: "#ffaa22",
        colorWarning: "#ff6622",
        colorError: "#ff2222",
        colorSuccess: "#52c41a",
        colorInfo: "#ffaa22",
      },
    }}
  >
    {children}
  </ConfigProvider>
);

export default WithTheme;
