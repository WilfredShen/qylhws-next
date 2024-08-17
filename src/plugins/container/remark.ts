import type { Html, Parent } from "mdast";
import { codes } from "micromark-util-symbol";
import type { Code } from "micromark-util-types";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

import { encodePropertiesToString } from "@/utils/escape";

import type { Container } from "./mdast";
import { containerMdast } from "./mdast";
import { containerFlow } from "./syntax";

interface Options {
  fenceCode?: NonNullable<Code>;
}

const remarkContainer: Plugin<[Options?]> = function (options = {}) {
  const { fenceCode = codes.equalsTo } = options;

  const data = this.data();

  data.micromarkExtensions = data.micromarkExtensions ?? [];
  data.fromMarkdownExtensions = data.fromMarkdownExtensions ?? [];

  data.micromarkExtensions.push(containerFlow(fenceCode));
  data.fromMarkdownExtensions.push(containerMdast());

  return tree => visit(tree, "ws-container", visitor);

  function visitor(node: Container, index: number, parent: Parent) {
    const { component, meta } = node;
    const properties = encodePropertiesToString({
      type: component,
      meta: meta,
    });

    parent.children[index] = {
      type: "html",
      value: component ? `<ws-container ${properties}>` : `</ws-container>`,
    } satisfies Html;
  }
};

export default remarkContainer;
