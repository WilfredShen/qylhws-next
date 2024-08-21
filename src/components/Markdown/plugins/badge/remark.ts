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
  let type = "default";
  const firstIndex = match.indexOf("|");

  if (firstIndex >= 0) {
    type = match.slice(0, firstIndex).trim();
    text = match.slice(firstIndex + 1).trim();
  }

  return {
    type: "html",
    value: `<ws-badge ${encodePropertiesToString({
      type,
    })}>${text}</ws-badge>`,
  } satisfies Html;
}
