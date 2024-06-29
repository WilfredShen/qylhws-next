import { Container } from "./mdast";

declare module "micromark-util-types" {
  interface TokenTypeMap {
    containerFlowFence: "containerFlowFence";
    containerFlowFenceSequence: "containerFlowFenceSequence";
    containerFlowFenceInfo: "containerFlowFenceInfo";
    containerFlowFenceMeta: "containerFlowFenceMeta";
  }
}

declare module "mdast" {
  interface RootContentMap {
    "ws-container": Container;
  }
}

export { default } from "./remark";
