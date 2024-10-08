import type { Container as WsContainer } from "@/components/Markdown/plugins/container";
import type { Reference as WsReference } from "@/components/Markdown/plugins/reference";
import { FrontMatter } from "./article";

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

  interface CodeData {
    filename?: string;
  }
}

declare module "hast" {
  interface Data {
    lineNumber?: [number, number];
  }
}

declare module "unified" {
  interface Data {
    matter: FrontMatter;
  }
}
