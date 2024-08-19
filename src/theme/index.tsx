import React from "react";

import { ConfigProvider } from "antd";

export interface WithThemeProps {
  children?: React.ReactNode;
}

const WithTheme = ({ children }: WithThemeProps) => (
  <ConfigProvider
    theme={{
      cssVar: true,
      hashed: false,
      token: {
        fontSize: 16,
        colorPrimary: "#ff6600",
        colorWarning: "#ffaa00",
        colorError: "#ff2200",
        colorSuccess: "#52c41a",
        colorInfo: "#ff6600",
        colorTextBase: "#141414",
      },
    }}
  >
    {children}
  </ConfigProvider>
);

export default WithTheme;
