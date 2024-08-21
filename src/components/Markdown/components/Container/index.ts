import CodeGroup from "./CodeGroup";
import Detail from "./Detail";
import Note from "./Note";
import { registerComponent } from "./share";
import Tabs from "./Tabs";

export { default } from "./Container";
export * from "./Container";

registerComponent("tabs", Tabs);
registerComponent("note", Note);
registerComponent("detail", Detail);
registerComponent("code-group", CodeGroup);
