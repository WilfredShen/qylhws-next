import { Html, Root } from "mdast";
import { findAndReplace } from "mdast-util-find-and-replace";
import { Plugin } from "unified";

const RE_BUDGE = /(?<=^|\s)#[^\s#]([^#]*[^#\s])?#(?=$|\s)/g;

const remarkBadge: Plugin<[], Root> = () => {
  const replacer = (match: string) => {
    return {
      type: "html",
      value: `<ws-badge>${match.slice(1, -1)}</ws-badge>`,
    } satisfies Html;
  };
  return tree => {
    findAndReplace(tree, [RE_BUDGE, replacer]);
  };
};

export default remarkBadge;
