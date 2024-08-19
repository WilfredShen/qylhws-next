import React from "react";

import type { ElementProps } from "@/types/element";
import { omitNode } from "@/utils/common";
import { Checkbox } from "antd";

export interface InputProps
  extends ElementProps,
    React.InputHTMLAttributes<HTMLInputElement> {}

const Input = (props: InputProps) => {
  const { type, checked } = props;

  if (type === "checkbox") return <Checkbox checked={!!checked} />;

  return <input {...omitNode(props)} />;
};

export default Input;
