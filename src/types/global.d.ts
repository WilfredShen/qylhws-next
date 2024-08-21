import type { Container as WsContainer } from "@/components/Markdown/plugins/container";
import type { Reference as WsReference } from "@/components/Markdown/plugins/reference";

declare module "micromark-util-types" {
  interface TokenTypeMap {
    containerFlowFence: "containerFlowFence";
    containerFlowFenceSequence: "containerFlowFenceSequence";
    containerFlowFenceInfo: "containerFlowFenceInfo";
    containerFlowFenceMeta: "containerFlowFenceMeta";
    referenceFlowFence: "referenceFlowFence";
    referenceFlowFenceSequence: "referenceFlowFenceSequence";
    referenceFlowFenceInfo: "referenceFlowFenceInfo";
    referenceFlowFenceMeta: "referenceFlowFenceMeta";
  }
}

declare module "mdast" {
  interface RootContentMap {
    "ws-container": WsContainer;
    "ws-reference": WsReference;
  }
}

declare module "unified" {
  interface Data {
    matter: Record<string, unknown>;
  }
}
