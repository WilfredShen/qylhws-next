import NoteContainer from "./NoteContainer";
import { registerComponent } from "./share";
import TabsContainer from "./TabsContainer";

export { default } from "./Container";
export * from "./Container";

registerComponent("tabs", TabsContainer);
registerComponent("note", NoteContainer);
