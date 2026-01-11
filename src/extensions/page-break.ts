import { Node, mergeAttributes } from "@tiptap/core";

// --- TYPE DECLARATION (This fixes the TS Error) ---
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pageBreak: {
      /**
       * Insert a page break
       */
      setPageBreak: () => ReturnType;
    };
  }
}

export const PageBreak = Node.create({
  name: "pageBreak",

  // "block" means it takes up the full width
  group: "block",

  // "atom" means it is a single unit, not a container for other text
  atom: true,

  parseHTML() {
    return [{ tag: "div[data-type='page-break']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "page-break" }),
    ];
  },

  addCommands() {
    return {
      setPageBreak:
        () =>
        ({ chain }) => {
          return (
            chain()
              .insertContent({ type: "pageBreak" })
              // Add a new paragraph after the break so users can keep typing
              .insertContent({ type: "paragraph" })
              .run()
          );
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Enter": () => this.editor.commands.setPageBreak(),
    };
  },
});