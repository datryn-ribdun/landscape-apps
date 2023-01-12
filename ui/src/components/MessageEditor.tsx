import cn from 'classnames';
import { Editor, EditorContent, JSONContent, useEditor } from '@tiptap/react';
import React, { useCallback, useEffect, useMemo } from 'react';
import Document from '@tiptap/extension-document';
import Blockquote from '@tiptap/extension-blockquote';
import Placeholder from '@tiptap/extension-placeholder';
import Bold from '@tiptap/extension-bold';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Link from '@tiptap/extension-link';
import Text from '@tiptap/extension-text';
import History from '@tiptap/extension-history';
import Paragraph from '@tiptap/extension-paragraph';
import HardBreak from '@tiptap/extension-hard-break';
import { useIsMobile } from '@/logic/useMedia';
import ChatInputMenu from '@/chat/ChatInputMenu/ChatInputMenu';
import { refPasteRule, Shortcuts } from '@/logic/tiptap';
import { useChatBlocks, useChatStore } from '@/chat/useChatStore';
import { useCalm } from '@/state/settings';
import Mention from '@tiptap/extension-mention';
import { PASTEABLE_IMAGE_TYPES } from '@/constants';
import useFileUpload from '@/logic/useFileUpload';
import { useFileStore } from '@/state/storage';
import { EditorProps } from 'prosemirror-view';
import MentionPopup from './Mention/MentionPopup';
import { useGroup, useRouteGroup } from '@/state/groups';

interface HandlerParams {
  editor: Editor;
}

interface useMessageEditorParams {
  whom?: string;
  content: JSONContent | string;
  placeholder?: string;
  editorClass?: string;
  allowMentions?: boolean;
  onEnter: ({ editor }: HandlerParams) => boolean;
  onUpdate?: ({ editor }: HandlerParams) => void;
}

export function useMessageEditor({
  whom,
  content,
  placeholder,
  editorClass,
  allowMentions = false,
  onEnter,
  onUpdate,
}: useMessageEditorParams) {
  const calm = useCalm();
  const chatBlocks = useChatBlocks(whom);
  const { setBlocks } = useChatStore.getState();
  const { files } = useFileStore();
  const { uploadFiles } = useFileUpload();

  const onReference = useCallback(
    (r) => {
      if (!whom) {
        return;
      }
      setBlocks(whom, [...chatBlocks, { cite: r }]);
    },
    [chatBlocks, setBlocks, whom]
  );

  const handleDrop = useCallback(
    (_view, event: DragEvent, _slice) => {
      if (!whom) {
        return false;
      }
      if (
        event.dataTransfer &&
        Array.from(event.dataTransfer.files).some((f) =>
          PASTEABLE_IMAGE_TYPES.includes(f.type)
        )
      ) {
        // TODO should blocks first be updated here to show the loading state?
        uploadFiles(event.dataTransfer.files);
        return true;
      }

      return false;
    },
    [uploadFiles, whom]
  );

  const handlePaste = useCallback(
    (_view, event: ClipboardEvent, _slice) => {
      if (!whom) {
        return false;
      }
      if (
        event.clipboardData &&
        Array.from(event.clipboardData.files).some((f) =>
          PASTEABLE_IMAGE_TYPES.includes(f.type)
        )
      ) {
        // TODO should blocks first be updated here to show the loading state?
        uploadFiles(event.clipboardData.files);
        return true;
      }

      return false;
    },
    [uploadFiles, whom]
  );

  // update the Attached Items view when files are uploaded
  useEffect(() => {
    if (whom && files && Object.values(files).length) {
      // TODO: handle existing blocks (other refs)
      setBlocks(
        whom,
        Object.values(files).map((f) => ({
          image: {
            src: f.url, // TODO: what to put when still loading?
            height: 200, // TODO
            width: 200,
            alt: f.file.name,
          },
        }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const keyMapExt = useMemo(
    () =>
      Shortcuts({
        Enter: ({ editor }) => onEnter({ editor } as any),
        'Shift-Enter': ({ editor }) =>
          editor.commands.first(({ commands }) => [
            () => commands.newlineInCode(),
            () => commands.createParagraphNear(),
            () => commands.liftEmptyBlock(),
            () => commands.splitBlock(),
          ]),
      }),
    [onEnter]
  );

  const extensions = [
    Blockquote,
    Bold.extend({ exitable: true, inclusive: false }),
    Code.extend({
      excludes: undefined,
      exitable: true,
      inclusive: false,
    }).configure({
      HTMLAttributes: {
        class: 'rounded px-1 bg-gray-50 dark:bg-gray-100',
      },
    }),
    CodeBlock.configure({
      HTMLAttributes: {
        class: 'mr-4 px-2 rounded bg-gray-50 dark:bg-gray-100',
      },
    }),
    Document,
    HardBreak,
    History.configure({ newGroupDelay: 100 }),
    Italic.extend({ exitable: true, inclusive: false }),
    keyMapExt,
    Link.configure({
      openOnClick: false,
    }).extend({
      exitable: true,
      inclusive: false,
    }),
    Paragraph,
    Placeholder.configure({ placeholder }),
    Strike.extend({ exitable: true, inclusive: false }),
    Text.extend({
      addPasteRules() {
        return [refPasteRule(onReference)];
      },
    }),
  ];

  if (allowMentions) {
    extensions.unshift(
      Mention.extend({ priority: 1000 }).configure({
        HTMLAttributes: {
          class: 'inline-block rounded bg-blue-soft px-1.5 py-0 text-blue',
        },
        suggestion: MentionPopup,
      })
    );
  }

  return useEditor(
    {
      extensions,
      content: content || '',
      editorProps: {
        attributes: {
          class: cn('input-inner', editorClass),
          'aria-label': 'Message editor with formatting menu',
          spellcheck: `${!calm.disableSpellcheck}`,
        },
        handleDrop,
        handlePaste,
      },
      onUpdate: ({ editor }) => {
        if (onUpdate) {
          onUpdate({ editor } as HandlerParams);
        }
      },
    },
    [keyMapExt, placeholder, handlePaste]
  );
}

interface MessageEditorProps {
  editor: Editor;
  className?: string;
  inputClassName?: string;
}

export default function MessageEditor({
  editor,
  className,
  inputClassName,
}: MessageEditorProps) {
  const isMobile = useIsMobile();
  return (
    <div className={cn('input block p-0', className)}>
      {/* <AutocompletePatp editor={editor} /> */}
      {/* This is nested in a div so that the bubble  menu is keyboard accessible */}
      <EditorContent className={cn('w-full', inputClassName)} editor={editor} />
      {!isMobile ? <ChatInputMenu editor={editor} /> : null}
    </div>
  );
}
