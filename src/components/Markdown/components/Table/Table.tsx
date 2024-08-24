import type { TableHTMLAttributes } from "react";

import type { ElementProps } from "@/types/element";
import { mergeClassNames } from "@/utils/classnames";
import { omitNode } from "@/utils/common";

import "./Table.scss";

export interface TableProps
  extends ElementProps,
    TableHTMLAttributes<HTMLTableElement> {}

const Table = (props: TableProps) => {
  return (
    <div className={mergeClassNames("ws-table", "ws-card", "ws-bordered")}>
      <table {...omitNode(props)} />
    </div>
  );
};

export default Table;
