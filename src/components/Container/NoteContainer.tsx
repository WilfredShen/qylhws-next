import React from "react";

import { mergeClassNames } from "@/utils/classnames";

import type { ContainerProps } from "./share";

import "./NoteContainer.scss";
import {
  BellRing,
  Info,
  NotebookPen,
  OctagonAlert,
  Star,
  TriangleAlert,
} from "lucide-react";
import { capitalize } from "lodash";

enum NoteType {
  INFO = "info",
  TIP = "tip",
  IMPORTANT = "important",
  SUCCESS = "success",
  WARNING = "warning",
  DANGER = "danger",
}

const typeMap: Record<string, NoteType> = {
  info: NoteType.INFO,
  tip: NoteType.TIP,
  important: NoteType.IMPORTANT,
  success: NoteType.SUCCESS,
  warning: NoteType.WARNING,
  danger: NoteType.DANGER,
  error: NoteType.DANGER,
  caution: NoteType.DANGER,
};

const iconMap: Record<NoteType, React.ReactElement> = {
  [NoteType.INFO]: <Info />,
  [NoteType.TIP]: <NotebookPen />,
  [NoteType.IMPORTANT]: <BellRing />,
  [NoteType.SUCCESS]: <Star />,
  [NoteType.WARNING]: <TriangleAlert />,
  [NoteType.DANGER]: <OctagonAlert />,
};

const NoteContainer = (props: ContainerProps) => {
  const { meta, children } = props;

  const parsedMeta = meta
    ?.split(" ")
    .map(e => e.trim())
    .filter(Boolean);
  const metaType = parsedMeta?.[0].toLowerCase();
  const noteTitle = parsedMeta?.[1] ?? capitalize(metaType);
  const noteType = typeMap[metaType ?? "info"];

  return (
    <div
      className={mergeClassNames("ws-note", {
        [`ws-note-${noteType}`]: !!noteType,
      })}
    >
      {!!noteTitle && noteTitle !== "false" && (
        <div className="ws-note-title">
          {iconMap[noteType]}
          {noteTitle}
        </div>
      )}
      {children}
    </div>
  );
};

export default NoteContainer;
