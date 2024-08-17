import type { Literal } from "mdast";
import type { Extension } from "mdast-util-from-markdown";

export interface Container extends Literal {
  type: "ws-container";
  component?: string;
  meta?: string;
}

export const containerMdast = (): Extension => ({
  enter: {
    containerFlowFence(token) {
      const node: Container = {
        type: "ws-container",
        component: undefined,
        meta: undefined,
        value: "",
      };
      this.enter(node, token);
      this.buffer();
    },
    containerFlowFenceInfo() {
      this.buffer();
    },
    containerFlowFenceMeta() {
      this.buffer();
    },
  },
  exit: {
    containerFlowFence(token) {
      const data = this.resume();
      const node = this.stack[this.stack.length - 1] as Container;
      node.value = data;
      this.exit(token);
    },
    containerFlowFenceInfo() {
      const data = this.resume();
      const node = this.stack[this.stack.length - 2] as Container;
      node.component = data;
    },
    containerFlowFenceMeta() {
      const data = this.resume();
      const node = this.stack[this.stack.length - 2] as Container;
      node.meta = data;
    },
  },
});
