import { ConfigProvider } from "antd";
import React, { PropsWithChildren } from "react";

const WithTheme = ({ children }: PropsWithChildren) => (
  <ConfigProvider
    theme={{
      cssVar: true,
      hashed: false,
      token: {
        fontSize: 16,
        colorPrimary: "#ffaa00",
        colorWarning: "#ff6600",
        colorError: "#ff2200",
        colorSuccess: "#52c41a",
        colorInfo: "#ffaa00",
      },
    }}
  >
    {children}
  </ConfigProvider>
);

export default WithTheme;
