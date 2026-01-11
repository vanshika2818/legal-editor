"use client";

import { useEditor, EditorContent, Editor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import { PageBreak } from "@/extensions/page-break"; // Import the extension
import { Toggle } from "./ui/toggle";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  ListIcon,
  ListOrderedIcon,
  Quote,
  UndoIcon,
  RedoIcon,
  CodeIcon,
  HighlighterIcon,
  LinkIcon,
  UnlinkIcon,
  PrinterIcon,
  FilePlus, // Icon for Page Break
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ReactNode, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";
import { FloatingMenu as TiptapFloatingMenu } from "@tiptap/react/menus";
import { cn } from "@/lib/utils";

const Tiptap = ({
  content,
  onChange,
}: {
  content?: string;
  onChange?: (content: string) => void;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
      PageBreak, // Register the extension
    ],
    editorProps: {
      attributes: {
        // Styles for the "Page" look (8.5" x 11")
        class: cn(
          "prose dark:prose-invert prose-sm sm:prose-base focus:outline-none max-w-none",
          "min-h-[1056px] w-[816px] mx-auto p-[96px]", // 8.5in x 11in @ 96px/in
          "bg-white shadow-lg border border-gray-200 my-8",
          "print:shadow-none print:border-none print:m-0 print:p-0 print:w-full"
        ),
      },
    },
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    immediatelyRender: false,
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen py-8 print:bg-white print:py-0">
      {editor && (
        <div className="sticky top-4 z-50 mb-4 w-full max-w-[816px] bg-background border rounded-lg shadow-sm p-2 flex flex-wrap gap-1 print:hidden">
          <ToolBar editor={editor} onPrint={handlePrint} />
        </div>
      )}

      <div className="relative w-full print:w-full print:absolute print:top-0 print:left-0">
        {editor && (
          <>
            <BubbleMenu editor={editor} />
            <FloatingMenu editor={editor} />
          </>
        )}
        <EditorContent editor={editor} />
        <div className="fixed bottom-4 right-4 text-xs text-gray-400 print:hidden font-mono">
          US Letter (8.5" x 11")
        </div>
      </div>
    </div>
  );
};

export default Tiptap;

// ... LinkComponent ... (Keep your existing LinkComponent here)

function LinkComponent({
  editor,
  children,
}: {
  editor: Editor;
  children: ReactNode;
}) {
  const [linkUrl, setLinkUrl] = useState("");
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);

  const handleSetLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
    setIsLinkPopoverOpen(false);
    setLinkUrl("");
  };

  return (
    <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="flex flex-col gap-4">
          <h3 className="font-medium">Insert Link</h3>
          <Input
            placeholder="https://example.com"
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSetLink();
              }
            }}
          />
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setIsLinkPopoverOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSetLink}>Save</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const ToolBar = ({
  editor,
  onPrint,
}: {
  editor: Editor;
  onPrint: () => void;
}) => {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor.isActive("bold"),
      isItalic: ctx.editor.isActive("italic"),
      isUnderline: ctx.editor.isActive("underline"),
      isStrike: ctx.editor.isActive("strike"),
      isBulletList: ctx.editor.isActive("bulletList"),
      isOrderedList: ctx.editor.isActive("orderedList"),
      canUndo: ctx.editor.can().undo(),
      canRedo: ctx.editor.can().redo(),
      isHeading2: ctx.editor.isActive("heading", { level: 2 }),
      isHeading3: ctx.editor.isActive("heading", { level: 3 }),
      isHeading4: ctx.editor.isActive("heading", { level: 4 }),
    }),
  });

  const handleHeadingChange = (value: string) => {
    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(value.replace("heading", "")) as 2 | 3 | 4;
      editor.chain().focus().setHeading({ level }).run();
    }
  };

  return (
    <>
      <Select
        onValueChange={handleHeadingChange}
        value={
          editorState.isHeading2
            ? "heading2"
            : editorState.isHeading3
            ? "heading3"
            : editorState.isHeading4
            ? "heading4"
            : "paragraph"
        }
      >
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue placeholder="Paragraph" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paragraph">Paragraph</SelectItem>
          <SelectItem value="heading2">Heading 1</SelectItem>
          <SelectItem value="heading3">Heading 2</SelectItem>
          <SelectItem value="heading4">Heading 3</SelectItem>
        </SelectContent>
      </Select>

      <Toggle
        size="sm"
        pressed={editorState.isBold}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      >
        <BoldIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editorState.isItalic}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      >
        <ItalicIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editorState.isUnderline}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editorState.isBulletList}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
      >
        <ListIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editorState.isOrderedList}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrderedIcon className="h-4 w-4" />
      </Toggle>

      <div className="bg-border mx-1 h-6 w-px" />

      {/* Page Break Button */}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().setPageBreak().run()}
        title="Page Break (Ctrl+Enter)"
      >
        <FilePlus className="h-4 w-4 text-blue-600" />
      </Button>

      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={onPrint}
        title="Print"
      >
        <PrinterIcon className="h-4 w-4" />
      </Button>

      <div className="bg-border mx-1 h-6 w-px" />

      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editorState.canUndo}
      >
        <UndoIcon className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editorState.canRedo}
      >
        <RedoIcon className="h-4 w-4" />
      </Button>
    </>
  );
};

// ... BubbleMenu & FloatingMenu ... (Keep your existing menus, just omit for brevity if needed)
export function BubbleMenu({ editor }: { editor: Editor }) {
  // Use your existing BubbleMenu code here
  return null;
}
export function FloatingMenu({ editor }: { editor: Editor }) {
  // Use your existing FloatingMenu code here
  return null;
}