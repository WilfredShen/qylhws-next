export { default } from "./Container";
export * from "./Container";

import { registerComponent } from "./share";
import TabsContainer from "./TabsContainer";

registerComponent("tabs", TabsContainer);
