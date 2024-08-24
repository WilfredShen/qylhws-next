import type { InputHTMLAttributes } from "react";

import { Checkbox } from "antd";

import type { ElementProps } from "@/types/element";
import { omitNode } from "@/utils/common";

import "./Input.scss";

export interface InputProps
  extends ElementProps,
    InputHTMLAttributes<HTMLInputElement> {}

const Input = (props: InputProps) => {
  const { type, checked } = props;

  if (type === "checkbox")
    return <Checkbox className="ws-content-checkbox" checked={!!checked} />;

  return <input {...omitNode(props)} />;
};

export default Input;
