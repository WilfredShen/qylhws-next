import { Card } from "antd";

import { ElementProps } from "@/types/element";
import { mergeClassNames } from "@/utils/classnames";

import "./Table.scss";

export interface TableProps
  extends ElementProps,
    React.TableHTMLAttributes<HTMLTableElement> {}

const Table = (props: TableProps) => {
  const { node, ...otherProps } = props;
  const { className } = props;

  return (
    <Card className="ws-table-card">
      <table
        {...otherProps}
        className={mergeClassNames(className, "ws-table")}
      />
    </Card>
  );
};

export default Table;
