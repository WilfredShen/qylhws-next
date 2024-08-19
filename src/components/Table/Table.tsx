import React from "react";

import type { ElementProps } from "@/types/element";
import { mergeClassNames } from "@/utils/classnames";

import "./Table.scss";

export interface TableProps
  extends ElementProps,
    React.TableHTMLAttributes<HTMLTableElement> {}

const Table = (props: TableProps) => {
  const { node, ...otherProps } = props;

  return (
    <div
      className={mergeClassNames(
        "ws-table",
        "ws-content-card",
        "ws-content-card-bordered",
      )}
    >
      <table {...otherProps} />
    </div>
  );
};

export default Table;
