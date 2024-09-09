import type {
  Element as HastElement,
  Node,
  Parent as HastParent,
  Root,
  Text,
} from "hast";
import { toString } from "hast-util-to-string";
import { last, range } from "lodash";
import type { RefractorElement } from "refractor";
import { refractor } from "refractor/lib/all";
import type { Plugin } from "unified";
import { filter } from "unist-util-filter";
import { visit } from "unist-util-visit";

import type { Nullable } from "@/types/utils";
import { encodeStyleToString } from "@/utils/escape";
import { isValid } from "@/utils/validate";

interface Element extends RefractorElement {
  properties: {
    className: string[];
    style?: string;
    language?: string;
    filename?: string;
  };
}

interface CodeElement extends Element {
  tagName: "code";
}

interface PreElement extends Element {
  tagName: "pre";
}

interface Parent extends Node {
  children: Element["children"];
}

export interface RehypeCodeOptions {
  lineNumbers?: boolean;
  maxHeight?: number | string;
  /** 计算高度时不包含内边距 */
  maxLines?: number;
}

export enum DecoratorType {
  INSERT = "+",
  DELETE = "-",
  HIGHLIGHT = "!",
}

export interface CodeBlockMeta {
  language?: string;
  filename?: string;
  noLineNumbers: boolean;
  lineNumbers?: number;
  decorators: Nullable<DecoratorType>[];
  /** 装饰符的行号是否为绝对行号，即装饰符的行号对应的是代码块最终展示的行号 */
  absoluteDecorators: boolean;
  maxHeight?: Nullable<number | string>;
  /** 计算高度时不包含内边距 */
  maxLines?: Nullable<number>;
}

const rehypeCode: Plugin<[RehypeCodeOptions?], Root> = function (options = {}) {
  const data = this.data();

  return tree => visit(tree, "element", visitor);

  function visitor(node: HastElement, index?: number, parent?: HastParent) {
    if (!isCodeElement(node) || !isPreElement(parent)) return;

    /** 读取 markdown 文件中的配置 */
    const pageOptions = (data.matter.code ?? {}) as RehypeCodeOptions;

    /** 将 className 归一化为数组 */
    const code = normalizeClassName(node) as CodeElement;
    const pre = normalizeClassName(parent as HastElement) as PreElement;

    const meta = parseMeta((code.data?.meta as string)?.trim() ?? "");

    /** 执行 highlight */
    const lang = getLanguage(code) ?? meta.language;
    const root = lang
      ? refractor.highlight(trimEmptyLines(toString(code as HastElement)), lang)
      : (code as Parent);
    pre.properties.className.push(`language-${lang}`);
    code.properties.className = code.properties.className.filter(
      e => !e.startsWith("lang"),
    );

    /** 拆分多行文本，添加行号信息 */
    root.children = createFormatter()(root.children);
    const [_, lineCount] = getLineNumber(last(root.children)!)!;
    const startLineNumber = meta.lineNumbers ?? 1;
    const lineNumberRange = range(startLineNumber, startLineNumber + lineCount);
    withLineNumber(root, [1, lineCount]);

    /** 将内容分行 */
    const lineNodes = lineNumberRange.map((_, index) =>
      withLineNumber(createLineNode(), index + 1),
    );
    lineNodes.forEach((line, index) => {
      line.children =
        filter(root, (node: Node) => {
          const [start, end] = getLineNumber(node)!;
          return start <= index + 1 && end >= index + 1;
        })?.children ?? [];
    });

    const codeLineColumn = createDivNode();
    codeLineColumn.children = lineNodes;
    codeLineColumn.properties.className.push("code-lines");

    /** 添加行号和装饰符 */
    const showLineNumbers =
      !meta.noLineNumbers &&
      !!(meta.lineNumbers ?? pageOptions.lineNumbers ?? options.lineNumbers);
    if (!showLineNumbers) {
      code.children = [codeLineColumn];
    } else {
      const showDecorators = !!meta.decorators.find(Boolean);
      const lineNumberNodes = lineNumberRange.map((lineNumber, index) =>
        withLineNumber(createLineNumberNode(lineNumber), index + 1),
      );
      const decoratorNodes = showDecorators
        ? lineNumberRange.map((lineNumber, index) => {
            return withLineNumber(
              createDecoratorNode(
                meta.decorators[
                  meta.absoluteDecorators ? lineNumber : index + 1
                ],
              ),
              index + 1,
            );
          })
        : [];

      /** 行号单独一列，代码单独一列，行号宽度自适应 */
      const lineNumberColumn = createDivNode();
      if (showDecorators) {
        const children: Element[] = [];
        lineNumberRange.forEach((_, index) => {
          const lineNode = lineNodes[index];
          const lineNumberNode = lineNumberNodes[index];
          const decoratorNode = decoratorNodes[index];

          lineNode!.properties.className.push(
            ...decoratorNode!.properties.className.slice(1),
          );
          children.push(lineNumberNode!, decoratorNode!);
        });
        lineNumberColumn.children = children;
        lineNumberColumn.properties.className.push(
          "line-numbers",
          "with-decorators",
        );
      } else {
        lineNumberColumn.children = lineNumberNodes;
        lineNumberColumn.properties.className.push("line-numbers");
      }

      code.children = [lineNumberColumn, codeLineColumn];
    }

    pre.properties = {
      ...pre.properties,
      language: lang,
      filename: meta.filename,
    };
    code.properties.className.push("code-block");
    addStyle(
      code,
      encodeStyleToString({
        maxHeight: calcMaxHeight({
          options: { ...options, ...pageOptions },
          meta,
          lineCount,
        }),
      }),
    );
  }
};

export default rehypeCode;

function isCodeElement(node?: Node): node is CodeElement {
  return !!(
    node &&
    node.type === "element" &&
    "tagName" in node &&
    node.tagName === "code"
  );
}

function isPreElement(node?: Node): node is PreElement {
  return !!(
    node &&
    node.type === "element" &&
    "tagName" in node &&
    node.tagName === "pre"
  );
}

function addStyle(element: Element, style: string) {
  element.properties.style = element.properties.style
    ? element.properties.style + `; ${style}`
    : style;
}

function calcMaxHeight({
  options,
  meta,
  lineCount,
}: {
  options: RehypeCodeOptions;
  meta: CodeBlockMeta;
  lineCount: number;
}): Nullable<string> {
  const maxHeight = meta.maxHeight || options.maxHeight;
  const maxLines = meta.maxLines || options.maxLines;
  if (
    (!maxHeight && !maxLines) ||
    (maxHeight === "auto" && (!maxLines || maxLines === lineCount))
  )
    return undefined;
  if (typeof maxHeight === "number") return `${maxHeight}px`;
  if (typeof maxHeight === "string" && maxHeight !== "auto") return maxHeight;
  return `calc(var(--code-line-height) * ${maxLines} + var(--code-spacing))`;
}

/**
 * 解析 meta
 *
 * @param meta
 * @returns
 */
function parseMeta(meta: string): CodeBlockMeta {
  const match = meta.match(/(?<=^|\s)\[[^\]]+\](?=$|\s)/)?.[0].slice(1, -1);
  const colonIndex = match?.indexOf(":") ?? -1;
  const noLineNumbers = !!meta.match(/(?<=^|\s)no-line-numbers(?=$|\s)/i);
  const lineNumbers = meta.match(/(?<=^|\s)line-numbers(?:=(\d+))?(?=$|\s)/i);
  const decorators = meta.match(/(?<=^|\s)(?:[+-])?\{[^{}]*\}(?=$|\s)/g);
  const absoluteDecorators = !!meta.match(
    /(?<=^|\s)absolute-decorators(?=$|\s)/i,
  );
  const maxHeight = meta.match(/(?<=^|\s)max-height=(\S+)(?=$|\s)/i);
  const maxLines = meta.match(/(?<=^|\s)max-lines=(\d+)(?=$|\s)/i);

  return {
    language:
      colonIndex === -1 ? match : match?.slice(0, colonIndex) || undefined,
    filename:
      colonIndex === -1 ? match : match?.slice(colonIndex + 1) || undefined,
    noLineNumbers,
    lineNumbers: lineNumbers?.[1] ? +lineNumbers[1] : undefined,
    decorators: parseDecorators(decorators ?? []),
    absoluteDecorators,
    maxHeight: maxHeight?.[1]
      ? Number.isNaN(+maxHeight[1])
        ? maxHeight[1]
        : +maxHeight[1]
      : undefined,
    maxLines: maxLines?.[1] ? +maxLines[1] : undefined,
  };
}

/**
 * 解析装饰符
 *
 * @param items
 * @returns
 */
function parseDecorators(items: string[]) {
  const result: DecoratorType[] = [];
  items.forEach(item => {
    const defaultType = parseDecoratorType(item) ?? DecoratorType.HIGHLIGHT;
    const leftBracket = item.indexOf("{");
    const rightBracket = item.indexOf("}");
    const value = item.substring(leftBracket + 1, rightBracket);
    value
      .split(",")
      .map(e => e.trim())
      .filter(Boolean)
      .forEach(e => {
        const decoratorType = parseDecoratorType(e);
        if (decoratorType) e = e.slice(1);
        if (!e.match(/^\d+(-\d+)?/)) return;
        const [begin, end = begin] = e.split("-").map<number>(Number);
        range(begin, end + 1).forEach(lineNumber => {
          result[lineNumber] = decoratorType ?? defaultType;
        });
      });
  });
  return result;

  function parseDecoratorType(item: string): Nullable<DecoratorType> {
    if (
      item.startsWith(DecoratorType.INSERT) ||
      item.startsWith(DecoratorType.DELETE)
    )
      return item[0] as DecoratorType;
  }
}

/**
 * 归一化 className 类型为 string[]
 *
 * @param node
 * @returns
 */
function normalizeClassName<T extends HastElement>(node: T) {
  if (
    !node.properties.className ||
    typeof node.properties.className === "boolean"
  ) {
    node.properties.className = [] as string[];
  } else if (!Array.isArray(node.properties.className)) {
    node.properties.className = [`${node.properties.className}`];
  }
  return node as T & { properties: { className: string[] } };
}

function getLanguage(node: Element) {
  const className = node.properties.className;
  const regex = /(?<=^|\s)lang(?:uage)?-(\S+)(?=$|\s)/i;
  for (const item of className) {
    if (typeof item !== "string") continue;
    const match = regex.exec(item);
    if (match) return match[1];
  }
}

/**
 * 创建一个格式化函数（单次格式化需要共用一个行号进行记录，因此需要创建一个闭包）
 *
 * @returns 格式化函数
 */
function createFormatter() {
  let currentLineNumber = 1;
  return formatChildren;

  /**
   * 拆分含有换行符的文本节点，确保所有叶子节点都是单行的，并给所有节点添加行号信息
   *
   * @param nodes 待处理节点列表
   * @returns 新的节点列表
   */
  function formatChildren(nodes: Element["children"]) {
    const result: Element["children"] = [];
    nodes.forEach(node => {
      if (node.type === "text") {
        const value = node.value;
        const lines = value.split("\n");
        if (lines.length <= 1) {
          withLineNumber(node, currentLineNumber);
          result.push(node);
        } else {
          lines.forEach((line, index) => {
            if (index !== lines.length - 1) line += "\n";
            result.push(
              withLineNumber(
                {
                  type: "text",
                  value: line,
                },
                currentLineNumber + index,
              ) satisfies Text,
            );
          });
        }
        currentLineNumber += lines.length - 1;
      } else if (hasChildren(node)) {
        const initLineNumber = currentLineNumber;
        node.children = formatChildren(node.children);
        withLineNumber(node, [initLineNumber, currentLineNumber]);
        result.push(node);
      } else {
        // 当前不可能进入该逻辑，未来可能发生变化，可以通过 never 的报错进行提示
        const _: never = node;
        result.push(node);
      }
    });
    return result.filter(node => node.type !== "text" || node.value);
  }
}

/**
 * 输入节点是否含有子节点
 *
 * @param value 待检测对象
 * @returns 检测结果
 */
function hasChildren<T>(
  value: Nullable<T>,
): value is T & { children: unknown } {
  return (
    isValid(value) && Object.prototype.hasOwnProperty.call(value, "children")
  );
}

function createLineNode(): Element {
  return {
    type: "element",
    tagName: "span",
    properties: { className: ["code-line"] },
    children: [],
  };
}

function createLineNumberNode(lineNumber: number): Element {
  return {
    type: "element",
    tagName: "span",
    properties: { className: ["line-number"] },
    children: [createTextNode(lineNumber.toString())],
  };
}

function createDecoratorNode(decorator: Nullable<DecoratorType>): Element {
  return {
    type: "element",
    tagName: "span",
    properties: {
      className: ["line-decorator", getDecoratorClassName(decorator)],
    },
    children: [createTextNode(getDecoratorText(decorator))],
  };
}

function createDivNode(): Element {
  return {
    type: "element",
    tagName: "div",
    properties: { className: [] },
    children: [],
  };
}

function createTextNode(value: string): import("refractor").Text {
  return {
    type: "text",
    value,
  };
}

/**
 * 给输入节点添加行号信息
 *
 * @param node 节点
 * @param lineNumber 行号信息
 * @returns 已添加行号信息的节点（依旧是输入的节点）
 */
function withLineNumber<T extends Node>(
  node: T,
  lineNumber: number | [number, number],
): T {
  node.data = {
    ...node.data,
    lineNumber:
      typeof lineNumber === "number" ? [lineNumber, lineNumber] : lineNumber,
  };
  return node;
}

/**
 * 从节点中解析行号信息
 *
 * @param node 节点
 * @returns 行号信息
 */
function getLineNumber<T extends Node>(node: T) {
  return node.data?.lineNumber;
}

function getDecoratorClassName(decorator: Nullable<DecoratorType>) {
  switch (decorator) {
    case DecoratorType.INSERT:
      return "line-inserted";
    case DecoratorType.DELETE:
      return "line-deleted";
    case DecoratorType.HIGHLIGHT:
      return "line-highlighted";
    default:
      return "";
  }
}

function getDecoratorText(decorator: Nullable<DecoratorType>) {
  switch (decorator) {
    case DecoratorType.INSERT:
    case DecoratorType.DELETE:
      return decorator;
    case DecoratorType.HIGHLIGHT:
    default:
      return "";
  }
}

/**
 * 移除开头和结尾的空行
 *
 * @param content
 * @returns
 */
function trimEmptyLines(content: string): string {
  return content.replace(/^(\s*\n)+/g, "").replace(/(\s*\n)+$/g, "");
}
