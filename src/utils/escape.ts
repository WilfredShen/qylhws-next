import { Nullable } from "@/types/utils";
import { isValid } from "./validate";
import { camelCase, kebabCase } from "lodash";

function escapeHtmlChar(char: string): string {
  switch (char) {
    case '"':
      return "&quot;";
    case "'":
      return "&#39;";
    case "&":
      return "&amp;";
    case "<":
      return "&lt;";
    case ">":
      return "&gt;";
    default:
      return char;
  }
}

function unescapeHtmlChar(text: string): string {
  switch (text) {
    case "&quot;":
      return '"';
    case "&#39;":
      return "'";
    case "&amp;":
      return "&";
    case "&lt;":
      return "<";
    case "&gt;":
      return ">";
    default:
      return text;
  }
}

export function escapeHtml(text: Nullable<string>): Nullable<string> {
  if (!text) return text;

  let escapedText = "";
  let lastIndex = 0;
  for (const match of text.matchAll(/["'&<>]/g)) {
    const { index, 0: value } = match;
    const escaped = escapeHtmlChar(value);
    escapedText += text.slice(lastIndex, index) + escaped;
    lastIndex = index + value.length;
  }

  if (lastIndex < text.length) escapedText += text.slice(lastIndex);

  return escapedText;
}

export function unescapeHtml(text: Nullable<string>): Nullable<string> {
  if (!text) return text;

  let unescapedText = "";
  let lastIndex = 0;
  for (const match of text.matchAll(/&(?:quot|#39|amp|lt|gt);/g)) {
    const { index, 0: value } = match;
    const unescaped = unescapeHtmlChar(value);
    unescapedText += text.slice(lastIndex, index) + unescaped;
    lastIndex = index + value.length;
  }

  if (lastIndex < text.length) unescapedText += text.slice(lastIndex);

  return unescapedText;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function kebabObjectToCamelObject(value: any) {
  if (typeof value !== "object" || !value) return value;
  Object.entries(value).forEach(([k, v]) => {
    delete value[k];
    value[camelCase(k)] = kebabObjectToCamelObject(v);
  });
  return value;
}

export function encodePropertiesToString(
  props: Record<string | number, unknown>,
) {
  return Object.entries(props)
    .map(([key, value]) =>
      isValid(value) ? `${camelCase(key)}="${escapeHtml(String(value))}"` : "",
    )
    .filter(Boolean)
    .join(" ");
}

export function encodeStyleToString(style: Record<string, unknown>) {
  return Object.entries(style)
    .map(([key, value]) =>
      isValid(value) ? `${kebabCase(key)}: ${value}` : "",
    )
    .filter(Boolean)
    .join("; ");
}
