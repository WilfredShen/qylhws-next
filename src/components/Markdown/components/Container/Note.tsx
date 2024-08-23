import React from "react";

import { capitalize } from "lodash";
import {
  BellRing,
  Info,
  NotebookPen,
  OctagonAlert,
  Star,
  TriangleAlert,
} from "lucide-react";

import { mergeClassNames } from "@/utils/classnames";

import type { ContainerProps } from "./share";

import "./Note.scss";

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
  note: NoteType.INFO,
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

export interface NoteProps extends ContainerProps {
  noteType?: string;
  title?: React.ReactNode;
}

const Note = (props: NoteProps) => {
  const { meta, noteType: typeProp, title, children } = props;

  const parsedMeta = meta
    ?.split(" ")
    .map(e => e.trim())
    .filter(Boolean);
  const metaType = parsedMeta?.[0].toLowerCase();
  const noteTitle = title ?? parsedMeta?.[1] ?? capitalize(metaType);
  const noteType = typeMap[typeProp?.toLowerCase() ?? metaType ?? "info"];

  return (
    <div
      className={mergeClassNames("ws-note", {
        [`ws-note-${noteType}`]: !!noteType,
      })}
    >
      {!!noteTitle && noteTitle !== "false" && (
        <div className="ws-note-title">
          <span>{iconMap[noteType]}</span>
          <span>{noteTitle}</span>
        </div>
      )}
      {children}
    </div>
  );
};

export default Note;
