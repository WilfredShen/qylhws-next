import { Collapse } from "antd";

import { mergeClassNames } from "@/utils/classnames";

import type { ContainerProps } from "./share";

import "./Detail.scss";

const Detail = (props: ContainerProps) => {
  const { meta, children, className } = props;

  const label = meta?.trim() || "Detail";

  return (
    <Collapse
      className={mergeClassNames("ws-detail", className)}
      items={[{ key: 1, label, children }]}
    />
  );
};

export default Detail;
