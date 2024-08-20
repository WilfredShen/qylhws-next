import { markdownSpace } from "micromark-util-character";
import { codes, types } from "micromark-util-symbol";
import type { Code, Effects, State, TokenType } from "micromark-util-types";

export function isFileEnding(code: Code): code is null {
  return code === codes.eof;
}

export function isLineEnding(code: Code) {
  return !isFileEnding(code) && code < -2;
}

export function isEnding(code: Code) {
  return isFileEnding(code) || isLineEnding(code);
}

export const isWhiteSpace = markdownSpace;

export function consumeLineEnding(effects: Effects, code: Code) {
  if (!isLineEnding(code)) return;
  effects.enter(types.lineEnding);
  effects.consume(code);
  effects.exit(types.lineEnding);
}

export function consumeWhiteSpaces(
  effects: Effects,
  finish: State,
  type: TokenType = types.whitespace,
): State {
  return start;

  function start(code: Code) {
    // 不是空白符直接返回
    if (!isWhiteSpace(code)) return finish(code);

    // 空白符
    effects.enter(type);

    return consumer(code);
  }

  function consumer(code: Code) {
    // 是空白符则消耗
    if (markdownSpace(code)) {
      effects.consume(code);
      return consumer;
    }

    /** 空白符已消耗完 */

    effects.exit(type);

    return finish(code);
  }
}
