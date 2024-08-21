import React from "react";

import type { Components as JsxComponents } from "hast-util-to-jsx-runtime";

import Anchor from "./Anchor";
import Badge from "./Badge";
import BlockQuote from "./BlockQuote";
import Container from "./Container";
import * as Headings from "./Heading";
import Image from "./Image";
import Input from "./Input";
import Table from "./Table";

type Components = {
  [key in keyof JsxComponents | `ws-${string}`]: key extends keyof JsxComponents
    ? JsxComponents[key]
    : React.ComponentType<any>;
};

const components: Partial<Components> = {
  "ws-container": Container,
  "ws-badge": Badge,
  ...Headings,
  a: Anchor,
  table: Table,
  input: Input,
  img: Image,
  blockquote: BlockQuote,
};

export default components;
