import React from "react";

import type { Components as JsxComponents } from "hast-util-to-jsx-runtime";

import Anchor from "./components/Anchor";
import Badge from "./components/Badge";
import BlockQuote from "./components/BlockQuote";
import Container from "./components/Container";
import * as Headings from "./components/Heading";
import Image from "./components/Image";
import Input from "./components/Input";
import Table from "./components/Table";

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
