import { codes, types } from "micromark-util-symbol";
import type { Code, Extension, TokenType } from "micromark-util-types";

import { consumeWhiteSpaces, isEnding, isWhiteSpace } from "../syntax-utils";

const fenceType: TokenType = "referenceFlowFence";
const sequenceType: TokenType = "referenceFlowFenceSequence";
const infoType: TokenType = "referenceFlowFenceInfo";
const metaType: TokenType = "referenceFlowFenceMeta";

const referenceSyntax = (fenceCode: NonNullable<Code>): Extension => {
  /** 是否为分隔符 */
  const isFence = (code: Code) => code === fenceCode;

  /** 是否为引号 */
  const isQuote = (code: Code) =>
    code === codes.quotationMark || code === codes.apostrophe;

  return {
    flow: {
      [fenceCode]: {
        tokenize: function (effects, ok, nok) {
          const self = this;
          let fenceLength = 0;
          let infoExitCode: Code = codes.space;
          let quoteCount = 0;

          return start;

          function start(code: Code) {
            const position = self.now();

            // 必须是分隔符且在行首
            if (!isFence(code) || position.column !== 1) return nok(code);

            // 分隔符所在行
            effects.enter(fenceType);
            effects.enter(types.chunkString, { contentType: "string" });
            // 分隔符序列
            effects.enter(sequenceType);

            return sequence(code);
          }

          function sequence(code: Code) {
            if (isFence(code)) {
              fenceLength++;
              effects.consume(code);
              return sequence;
            }

            if (fenceLength < 3) return nok(code);

            /** 分隔符消耗完毕，且长度大于等于 3 */

            effects.exit(sequenceType);

            // 尝试消耗空白符
            return isWhiteSpace(code)
              ? consumeWhiteSpaces(effects, infoBefore)(code)
              : infoBefore(code);
          }

          function infoBefore(code: Code) {
            /** 此时 code 不可能为空白符 */

            if (isEnding(code)) return after(code);

            // 如果 info 以单/双引号开头，则必须以相同字符结束
            if (isQuote(code)) infoExitCode = code;

            effects.enter(infoType);
            effects.enter(types.chunkString, { contentType: "string" });

            return info(code);
          }

          function info(code: Code) {
            if (
              (!isWhiteSpace(code) ||
                (!isWhiteSpace(infoExitCode) && quoteCount < 2)) &&
              !isEnding(code)
            ) {
              if (isQuote(code)) quoteCount++;
              effects.consume(code);
              return info;
            }

            /** 遇到空白符或结束符 */

            effects.exit(types.chunkString);
            effects.exit(infoType);

            return isWhiteSpace(code)
              ? consumeWhiteSpaces(effects, metaBefore)(code)
              : after(code);
          }

          function metaBefore(code: Code) {
            /** 此时 code 不可能为空白符 */

            if (isEnding(code)) return after(code);

            effects.enter(metaType);
            effects.enter(types.chunkString, { contentType: "string" });

            return meta(code);
          }

          function meta(code: Code) {
            // meta 只有遇到结束符才停止，非前缀空白符也被视为 meta
            if (!isEnding(code)) {
              effects.consume(code);
              return meta;
            }

            /** meta 已消耗完 */

            effects.exit(types.chunkString);
            effects.exit(metaType);

            return after(code);
          }

          function after(code: Code) {
            /** 此时 code 必定为结束符 */

            effects.exit(types.chunkString);
            effects.exit(fenceType);

            return ok(code);
          }
        },
      },
    },
  };
};

export default referenceSyntax;
