import { Html, Root } from "mdast";
import { findAndReplace } from "mdast-util-find-and-replace";
import { Plugin } from "unified";

import { encodePropertiesToString } from "@/utils/escape";

const RE_BUDGE = /(?<=^|\s)#[^\s#]([^#]*[^#\s])?#(?=$|\s)/g;

const remarkBadge: Plugin<[], Root> = () => {
  return tree => findAndReplace(tree, [RE_BUDGE, replacer]);
};

export default remarkBadge;

function replacer(match: string) {
  match = match.slice(1, -1);
  let text = match;
  let color: string | undefined = undefined;
  const lastVerticalBarIndex = match.lastIndexOf("|");

  if (lastVerticalBarIndex >= 0) {
    text = match.slice(0, lastVerticalBarIndex).trim();
    color = match.slice(lastVerticalBarIndex + 1).trim();
  }

  return {
    type: "html",
    value: `<ws-badge ${encodePropertiesToString({
      color,
    })}>${text}</ws-badge>`,
  } satisfies Html;
}
