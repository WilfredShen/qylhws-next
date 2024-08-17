import React from "react";

import { ConfigProvider } from "antd";

export interface WithThemeProps {
  children?: React.ReactNode;
}

const WithTheme = ({ children }: WithThemeProps) => (
  <ConfigProvider
    prefixCls="ws"
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
