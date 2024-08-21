import { codes } from "micromark-util-symbol";
import type { Code } from "micromark-util-types";
import path from "path";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

import type { Reference } from "./mdast";
import refenrenceMdast from "./mdast";
import referenceSyntax from "./syntax";
import { readFileSync } from "fs";
import { Parent } from "mdast";

export interface RemarkContainerOptions {
  fenceCode?: NonNullable<Code>;
}

const remarkReference: Plugin<[RemarkContainerOptions?]> = function (
  options = {},
) {
  const { fenceCode = codes.lessThan } = options;

  const data = this.data();

  data.micromarkExtensions = data.micromarkExtensions ?? [];
  data.fromMarkdownExtensions = data.fromMarkdownExtensions ?? [];

  data.micromarkExtensions.push(referenceSyntax(fenceCode));
  data.fromMarkdownExtensions.push(refenrenceMdast());

  return tree => visit(tree, "ws-reference", visitor);

  function visitor(node: Reference, index: number, parent: Parent) {
    let { file, meta } = node;

    if (!file) throw new Error(`referenced file path is empty`);

    if (file.match(/^".*"$|^'.*'$/)) file = file.slice(1, -1);

    if (!file.match(/^@?\//)) {
      throw new Error(
        `referenced file path must start with "/" (alias for project root) or "@" (alias for "src" directory), but got "${file}"`,
      );
    }

    const rawPath = path.join(process.cwd(), file.replace(/^@/, "src"));

    const lastSlashIndex = rawPath.lastIndexOf("/");
    const lastHashIndex = rawPath.lastIndexOf("#");

    const absolutePath =
      lastHashIndex > lastSlashIndex
        ? rawPath.slice(0, lastHashIndex)
        : rawPath;
    const regionName =
      lastHashIndex > lastSlashIndex
        ? rawPath.slice(lastHashIndex + 1)
        : undefined;

    const content = readFileSync(absolutePath).toString();
    const lines = content.split("\n");

    const [begin, end] = (regionName && findRegion(lines, regionName)) || [
      0,
      lines.length,
    ];

    const regionLines = lines.slice(begin, end);

    meta = meta?.trim();
    const matchLang = meta?.match(/^\[(\w+)\]/);
    const codeLang =
      matchLang?.[1] ?? path.extname(absolutePath).replace(/^\./, "");

    parent.children.splice(index, 1, {
      type: "code",
      lang: codeLang,
      meta: meta?.slice(matchLang?.index ?? 0),
      value: regionLines.join("\n"),
    });
  }
};

export default remarkReference;

function findRegion(lines: string[], regionName: string) {
  const regionPatterns = [
    /^\/\/ ?#?((?:end)?region) ([\w*-]+)$/, // javascript, typescript, java
    /^\/\* ?#((?:end)?region) ([\w*-]+) ?\*\/$/, // css, less, scss
    /^#pragma ((?:end)?region) ([\w*-]+)$/, // C, C++
    /^<!-- #?((?:end)?region) ([\w*-]+) -->$/, // HTML, markdown
    /^#((?:End )Region) ([\w*-]+)$/, // Visual Basic
    /^::#((?:end)region) ([\w*-]+)$/, // Bat
    /^# ?((?:end)?region) ([\w*-]+)$/, // C#, PHP, Powershell, Python, perl & misc
  ];

  let matchedPattern: RegExp | null = null;
  let start = -1;

  for (const [index, line] of lines.entries()) {
    if (!matchedPattern) {
      for (const pattern of regionPatterns) {
        if (testLine(line, pattern, regionName)) {
          start = index + 1;
          matchedPattern = pattern;
          break;
        }
      }
    } else if (testLine(line, matchedPattern, regionName, true)) {
      return [start, index];
    }
  }
}

function testLine(
  line: string,
  pattern: RegExp,
  regionName: string,
  isEnd: boolean = false,
) {
  const [full, tag, name] = pattern.exec(line.trim()) || [];

  return !!(
    full &&
    tag &&
    name === regionName &&
    tag.match(isEnd ? /^[Ee]nd ?[rR]egion$/ : /^[rR]egion$/)
  );
}
