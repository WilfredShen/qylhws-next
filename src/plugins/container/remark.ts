import { visit } from "unist-util-visit";

import { Container, containerMdast } from "./mdast";
import { containerFlow } from "./syntax";

import { Plugin } from "unified";
import { Parent, Html } from "mdast";

const remarkContainer: Plugin = function () {
  const data = this.data();

  data.micromarkExtensions = data.micromarkExtensions ?? [];
  data.fromMarkdownExtensions = data.fromMarkdownExtensions ?? [];

  data.micromarkExtensions.push(containerFlow);
  data.fromMarkdownExtensions.push(containerMdast);

  return tree => {
    visit(
      tree,
      "ws-container",
      (node: Container, index: number, parent: Parent) => {
        const { component, meta } = node;

        parent.children[index] = {
          type: "html",
          value: component
            ? `<ws-container type="${component}" meta="${meta}">`
            : `</ws-container>`,
        } satisfies Html;
      },
    );
  };
};

export default remarkContainer;
