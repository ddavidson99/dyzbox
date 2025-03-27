'use client';

import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { 
  TextBolder, 
  TextItalic, 
  TextUnderline, 
  ListBullets, 
  ListNumbers, 
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  ArrowCounterClockwise,
  ArrowClockwise
} from '@phosphor-icons/react';
import IconButton from '../ui/IconButton';

export interface TipTapEditorRef {
  getContent: () => string;
  setContent: (content: string) => void;
  focus: () => void;
}

interface TipTapEditorProps {
  initialValue?: string;
  placeholder?: string;
  onChange?: (content: string) => void;
  minHeight?: string;
  readOnly?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 p-2 bg-gray-50 flex items-center space-x-1 rounded-t-md">
      <IconButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        tooltip="Bold"
        size="sm"
        className={editor.isActive('bold') ? 'bg-gray-200 text-gray-800' : ''}
      >
        <TextBolder size={18} weight={editor.isActive('bold') ? 'fill' : 'regular'} />
      </IconButton>
      
      <IconButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        tooltip="Italic"
        size="sm"
        className={editor.isActive('italic') ? 'bg-gray-200 text-gray-800' : ''}
      >
        <TextItalic size={18} weight={editor.isActive('italic') ? 'fill' : 'regular'} />
      </IconButton>
      
      <IconButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        tooltip="Underline"
        size="sm"
        className={editor.isActive('underline') ? 'bg-gray-200 text-gray-800' : ''}
      >
        <TextUnderline size={18} weight={editor.isActive('underline') ? 'fill' : 'regular'} />
      </IconButton>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      <IconButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        tooltip="Bullet List"
        size="sm"
        className={editor.isActive('bulletList') ? 'bg-gray-200 text-gray-800' : ''}
      >
        <ListBullets size={18} weight={editor.isActive('bulletList') ? 'fill' : 'regular'} />
      </IconButton>
      
      <IconButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        tooltip="Numbered List"
        size="sm"
        className={editor.isActive('orderedList') ? 'bg-gray-200 text-gray-800' : ''}
      >
        <ListNumbers size={18} weight={editor.isActive('orderedList') ? 'fill' : 'regular'} />
      </IconButton>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      <IconButton
        onClick={() => {
          const url = window.prompt('URL');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        active={editor.isActive('link')}
        tooltip="Add Link"
        size="sm"
        className={editor.isActive('link') ? 'bg-gray-200 text-gray-800' : ''}
      >
        <LinkIcon size={18} weight={editor.isActive('link') ? 'fill' : 'regular'} />
      </IconButton>
      
      <IconButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive('codeBlock')}
        tooltip="Code Block"
        size="sm"
        className={editor.isActive('codeBlock') ? 'bg-gray-200 text-gray-800' : ''}
      >
        <Code size={18} weight={editor.isActive('codeBlock') ? 'fill' : 'regular'} />
      </IconButton>
      
      <div className="flex-1"></div>
      
      <IconButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        tooltip="Undo"
        size="sm"
      >
        <ArrowCounterClockwise size={18} />
      </IconButton>
      
      <IconButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        tooltip="Redo"
        size="sm"
      >
        <ArrowClockwise size={18} />
      </IconButton>
    </div>
  );
};

const TipTapEditor = forwardRef<TipTapEditorRef, TipTapEditorProps>(({
  initialValue = '',
  placeholder = 'Write your message...',
  onChange,
  minHeight = '300px',
  readOnly = false
}, ref) => {
  const [content, setContent] = useState(initialValue);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      if (onChange) onChange(html);
    },
    editorProps: {
      attributes: {
        class: `focus:outline-none prose prose-sm max-w-none`,
        style: `min-height: ${minHeight}; height: 100%`,
      },
    },
  });
  
  useEffect(() => {
    if (editor && initialValue !== content) {
      editor.commands.setContent(initialValue);
      setContent(initialValue);
    }
  }, [initialValue, editor]);
  
  useImperativeHandle(ref, () => ({
    getContent: () => editor ? editor.getHTML() : '',
    setContent: (newContent: string) => {
      if (editor) {
        editor.commands.setContent(newContent);
        setContent(newContent);
      }
    },
    focus: () => {
      if (editor) {
        editor.commands.focus('start');
      }
    }
  }));
  
  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      {editor && <MenuBar editor={editor} />}
      <div className="p-4 bg-white" style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
      
      {editor && (
        <BubbleMenu 
          editor={editor} 
          tippyOptions={{ duration: 100 }}
          className="bg-white shadow-lg border border-gray-200 rounded-md overflow-hidden flex"
        >
          <IconButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            size="sm"
            className={editor.isActive('bold') ? 'bg-gray-200 text-gray-800' : ''}
          >
            <TextBolder size={16} />
          </IconButton>
          <IconButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            size="sm"
            className={editor.isActive('italic') ? 'bg-gray-200 text-gray-800' : ''}
          >
            <TextItalic size={16} />
          </IconButton>
          <IconButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            size="sm"
            className={editor.isActive('underline') ? 'bg-gray-200 text-gray-800' : ''}
          >
            <TextUnderline size={16} />
          </IconButton>
          <IconButton
            onClick={() => {
              const url = window.prompt('URL');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            active={editor.isActive('link')}
            size="sm"
            className={editor.isActive('link') ? 'bg-gray-200 text-gray-800' : ''}
          >
            <LinkIcon size={16} />
          </IconButton>
        </BubbleMenu>
      )}
    </div>
  );
});

TipTapEditor.displayName = 'TipTapEditor';

export default TipTapEditor; 