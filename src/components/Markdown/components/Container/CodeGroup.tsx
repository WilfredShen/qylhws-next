import type { ReactElement } from "react";

import { Tabs as AntdTabs, type TabsProps } from "antd";

import type { Nullable } from "@/types/utils";
import { mergeClassNames } from "@/utils/classnames";

import type { ContainerProps } from "./share";

import "./Tabs.scss";

type Child = Nullable<ReactElement | string>;

const CodeGroup = (props: ContainerProps) => {
  const { children } = props;

  const tabs = convertElementsToTabs(
    Array.isArray(children) ? children : [children],
  );

  if (!tabs.length) return null;

  return (
    <div
      className={mergeClassNames(
        "ws-code-group",
        "ws-tabs-card",
        "ws-card",
        "ws-shadowed",
      )}
    >
      <AntdTabs className="ws-tabs" items={tabs} />
    </div>
  );
};

export default CodeGroup;

function convertElementsToTabs(
  elements: Child[],
): NonNullable<TabsProps["items"]> {
  return elements
    .filter(
      (element): element is ReactElement =>
        !!(element && typeof element === "object" && element.type === "pre"),
    )
    .map((element, index) => {
      const label = element.props.filename;

      return {
        key: element.key || `tab#${index}`,
        label: label || `标签#${index + 1}`,
        children: element,
      };
    });
}
