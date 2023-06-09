import React from "react";
import { EditorView } from "prosemirror-view";
import { lift } from "prosemirror-commands";
import { undo, redo } from "prosemirror-history";
import { schema } from "../schema";
import ToggleMarkButton from "./ToggleMarkButton";
import ListButton from "./ListButton";
import ChecklistButton from "./ChecklistButton";
import CommandButton from "./CommandButton";
import BlockTypeButton from "./BlockTypeButton";
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatIndentDecrease,
  MdUndo,
  MdRedo,
} from "react-icons/md";
import { BiParagraph, BiHeading } from "react-icons/bi";

type Props = {
  editorView: EditorView;
};

export default function Toolbar({ editorView }: Props) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div>
        <ToggleMarkButton
          editorView={editorView}
          mark={schema.marks.strong}
          icon={MdFormatBold}
          title="Toggle strong style"
        />
        <ToggleMarkButton
          editorView={editorView}
          mark={schema.marks.em}
          icon={MdFormatItalic}
          title="Toggle emphasis style"
        />
        <span
          style={{
            borderRight: "1px solid #ddd",
            marginRight: "0.6rem",
          }}
        ></span>
        <BlockTypeButton
          nodeType={schema.nodes.paragraph}
          editorView={editorView}
          icon={BiParagraph}
          title="Change to paragraph"
        />
        <BlockTypeButton
          nodeType={schema.nodes.heading}
          attrs={{ level: 2 }}
          editorView={editorView}
          icon={BiHeading}
          title="Change to heading 2"
        />
        <ListButton
          editorView={editorView}
          nodeType={schema.nodes.bullet_list}
          icon={MdFormatListBulleted}
          title="Wrap in bullet list"
        />
        <ListButton
          editorView={editorView}
          nodeType={schema.nodes.ordered_list}
          icon={MdFormatListNumbered}
          title="Wrap in ordered list"
        />
        <ChecklistButton
          editorView={editorView}
          nodeType={schema.nodes.checklist}
          title="Wrap in checklist"
        />
        <CommandButton
          command={lift}
          editorView={editorView}
          icon={MdFormatIndentDecrease}
          title="Lift out of enclosing block"
        />
      </div>
      <div>
        <CommandButton
          command={undo}
          editorView={editorView}
          icon={MdUndo}
          title="Undo"
        />
        <CommandButton
          command={redo}
          editorView={editorView}
          icon={MdRedo}
          title="Redo"
        />
      </div>
    </div>
  );
}
