import React from "react";

import { Tabs as AntdTabs, TabsProps } from "antd";

import { mergeClassNames } from "@/utils/classnames";

import type { ContainerProps } from "./share";

import "./Tabs.scss";

type Child = React.ReactElement | string | null | undefined;

const Tabs = (props: ContainerProps) => {
  const { children } = props;

  const tabs = convertElementsToTabs(
    Array.isArray(children) ? children : [children],
  );

  if (!tabs.length) return null;

  return (
    <div
      className={mergeClassNames("ws-tabs-card", "ws-card", "ws-shadowed")}
    >
      <AntdTabs className="ws-tabs" items={tabs} />
    </div>
  );
};

export default Tabs;

function convertElementsToTabs(
  elements: Child[],
): NonNullable<TabsProps["items"]> {
  return elements
    .filter(
      (element): element is React.ReactElement =>
        !!(
          element &&
          typeof element === "object" &&
          "props" in element &&
          element.props?.type === "tabs-item"
        ),
    )
    .map((element, index) => {
      const meta: string = element.props.meta ?? "";
      const tabName = meta.match(/(?<=^|\s)\[([^[\]]*)\](?=$|\s)/)?.[1].trim();

      return {
        key: element.key || `tab#${index}`,
        label: tabName || `标签#${index + 1}`,
        children: element.props.children,
      };
    });
}
