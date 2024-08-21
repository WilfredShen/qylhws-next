import type { Literal } from "mdast";
import type { Extension } from "mdast-util-from-markdown";

export interface Reference extends Literal {
  type: "ws-reference";
  file?: string;
  meta?: string;
}

const refenrenceMdast = (): Extension => ({
  enter: {
    referenceFlowFence(token) {
      const node: Reference = {
        type: "ws-reference",
        file: undefined,
        meta: undefined,
        value: "",
      };
      this.enter(node, token);
      this.buffer();
    },
    referenceFlowFenceInfo() {
      this.buffer();
    },
    referenceFlowFenceMeta() {
      this.buffer();
    },
  },
  exit: {
    referenceFlowFence(token) {
      const data = this.resume();
      const node = this.stack[this.stack.length - 1] as Reference;
      node.value = data;
      this.exit(token);
    },
    referenceFlowFenceInfo() {
      const data = this.resume();
      const node = this.stack[this.stack.length - 2] as Reference;
      node.file = data;
    },
    referenceFlowFenceMeta() {
      const data = this.resume();
      const node = this.stack[this.stack.length - 2] as Reference;
      node.meta = data;
    },
  },
});

export default refenrenceMdast;
