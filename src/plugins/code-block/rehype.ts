import {
  Element as HastElement,
  Node,
  Parent as HastParent,
  Root,
  Text,
} from "hast";
import { toString } from "hast-util-to-string";
import _ from "lodash";
import { RefractorElement } from "refractor";
import { refractor } from "refractor/lib/all";
import { Plugin } from "unified";
import { filter } from "unist-util-filter";
import { visit } from "unist-util-visit";

interface CodeBlock extends HastElement {
  tagName: "code";
  data: {
    meta: string;
  };
}

interface Element extends RefractorElement {
  properties: {
    className: string[];
  };
}

interface Parent extends Node {
  children: Element["children"];
}

interface Options {
  lineNumbers?: false | undefined | "row" | "column" | "tiling";
}

interface Meta {
  startLineNumber: number;
}

const rehypeCodeBlock: Plugin<[Options], Root> = (options = {}) => {
  const { lineNumbers } = options;
  return tree => visit(tree, "element", visitor);

  function visitor(node: HastElement, index?: number, parent?: HastParent) {
    // @ts-expect-error: Parent 中没有 tagName 属性
    if (!parent || parent.tagName !== "pre" || node.tagName !== "code") return;
    const code = node as CodeBlock;

    const meta = parseMeta(code.data?.meta ?? "");
    const { startLineNumber } = meta;

    /* 将 className 归一化为数组 */
    if (
      !code.properties.className ||
      typeof code.properties.className === "boolean"
    ) {
      code.properties.className = [] as string[];
    } else if (!Array.isArray(code.properties.className)) {
      code.properties.className = [code.properties.className];
    }

    /* 执行 highlight */
    const lang = getLanguage(code);
    const root = lang
      ? refractor.highlight(toString(code), lang)
      : (code as Parent);

    /* 拆分多行文本，添加行号信息 */
    root.children = createFormatter()(root.children);
    const lineCount = getLineNumber(_.last(root.children)!)[1];
    withLineNumber(root, [1, lineCount]);

    /* 将内容分行 */
    const lineNodes = createLineNodes(lineCount);
    lineNodes.forEach((line, index) => {
      line.properties!.className = ["code-line"];
      const children = filter(root, (node: Node) => {
        const [start, end] = getLineNumber(node);
        return start <= index + 1 && end >= index + 1;
      })?.children;
      if (children) line.children = children;
    });

    const lineNumberNodes = lineNumbers
      ? Array.from(lineNodes, (_, index) =>
          withLineNumber(
            createLineNumberNode(startLineNumber + index),
            index + 1,
          ),
        )
      : [];

    if (lineNumbers === "row") {
      /* 将行号添加到行节点中，此时需要手动设置行号宽度 */
      lineNodes.forEach((line, index) => {
        line.children.unshift(lineNumberNodes[index]);
      });
      code.children = lineNodes as HastElement["children"];
      code.properties.className.push("code-layout-row");
      code.properties.style = `--line-number-size: ${
        (lineCount + startLineNumber).toString().length
      }`;
    } else if (lineNumbers === "column") {
      /* 行号单独一列，代码单独一列，行号宽度自适应 */
      const lineNumberColumn = createCodeNode();
      lineNumberColumn.children = lineNumberNodes;
      lineNumberColumn.properties.className.push("line-number-column");

      const codeLineColumn = createCodeNode();
      codeLineColumn.children = lineNodes;
      codeLineColumn.properties.className.push("code-line-column");

      code.children = [
        lineNumberColumn,
        codeLineColumn,
      ] as HastElement["children"];
      code.properties.className.push("code-layout-column");
    } else if (lineNumbers === "tiling") {
      /* 行号和代码混合在一起，不分行也不分列，此时需要手动设置行号宽度 */
      const nodes: Element["children"] = [];
      _.range(lineCount).forEach(index => {
        nodes.push(lineNumberNodes[index], lineNodes[index]);
      });
      code.children = nodes as HastElement["children"];
      code.properties.className.push("code-layout-tiling");
      code.properties.style = `--line-number-size: ${
        (lineCount + startLineNumber).toString().length
      }`;
    } else {
      code.children = lineNodes as HastElement["children"];
    }
  }
};

export default rehypeCodeBlock;

function parseMeta(meta: string): Meta {
  return {
    startLineNumber: 1,
  };
}

function getLanguage(node: HastElement) {
  const className = node.properties.className;
  if (!Array.isArray(className)) return;
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
function hasChildren<T>(value: T): value is T & { children: any } {
  return (
    value !== undefined &&
    value !== null &&
    Object.prototype.hasOwnProperty.call(value, "children")
  );
}

/**
 * 创建行节点列表
 *
 * @param size 行数
 * @returns 行节点列表
 */
function createLineNodes(size: number): Element[] {
  return Array.from({ length: size }, (_, index) => {
    return withLineNumber(
      {
        type: "element",
        tagName: "span",
        properties: { className: [] },
        children: [],
      },
      index + 1,
    );
  });
}

function createLineNumberNode(lineNumber: number): Element {
  return {
    type: "element",
    tagName: "span",
    properties: { className: ["line-number"] },
    children: [createTextNode(lineNumber.toString())],
  };
}

function createCodeNode(): Element {
  return {
    type: "element",
    tagName: "code",
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
function getLineNumber<T extends Node>(node: T): [number, number] {
  return (node.data as any).lineNumber;
}
