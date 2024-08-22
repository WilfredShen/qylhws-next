import { Html, Root } from "mdast";
import { findAndReplace } from "mdast-util-find-and-replace";
import { Plugin } from "unified";

import { encodePropertiesToString } from "@/utils/escape";

const RE_BUDGE = /((?<=^|[^#\s])#|\s#)[^\s#]([^#]*[^#\s])?#(?=$|[^#])/g;

const remarkBadge: Plugin<[], Root> = function () {
  return tree => findAndReplace(tree, [RE_BUDGE, replacer]);
};

export default remarkBadge;

function replacer(match: string) {
  match = match.trim().slice(1, -1);
  let text = match;
  let color = undefined;
  const firstIndex = match.indexOf("|");

  if (firstIndex >= 0) {
    text = match.slice(0, firstIndex).trim();
    color = match.slice(firstIndex + 1).trim();
  }

  return {
    type: "html",
    value: `<ws-badge ${encodePropertiesToString({
      color,
    })}>${text}</ws-badge>`,
  } satisfies Html;
}
