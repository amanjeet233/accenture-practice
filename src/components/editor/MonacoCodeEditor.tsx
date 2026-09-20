"use client";

import React, { useRef, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

interface MonacoCodeEditorProps {
  language: string;
  code: string;
  onChange: (value: string) => void;
  fontSize?: number;
  onRun?: () => void;
  onSubmit?: () => void;
}

export function MonacoCodeEditor({
  language,
  code,
  onChange,
  fontSize = 14,
  onRun,
  onSubmit,
}: MonacoCodeEditorProps) {
  const editorRef = useRef<any>(null);
  const onRunRef = useRef(onRun);
  const onSubmitRef = useRef(onSubmit);

  useEffect(() => {
    onRunRef.current = onRun;
    onSubmitRef.current = onSubmit;
  });

  // Map app languages to Monaco language identifiers
  const getMonacoLanguage = (lang: string) => {
    switch (lang.toLowerCase()) {
      case "javascript":
      case "js":
        return "javascript";
      case "python":
      case "py":
        return "python";
      case "java":
        return "java";
      case "cpp":
      case "c++":
        return "cpp";
      case "sql":
        return "sql";
      default:
        return "javascript";
    }
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Register keyboard shortcut: Ctrl+Enter / Cmd+Enter = Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRunRef.current) {
        onRunRef.current();
      }
    });

    // Register keyboard shortcut: Ctrl+Shift+Enter / Cmd+Shift+Enter = Submit
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
      () => {
        if (onSubmitRef.current) {
          onSubmitRef.current();
        }
      }
    );
  };

  // Format code helper
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize });
    }
  }, [fontSize]);

  return (
    <div className="w-full h-full relative bg-[#1e1e1e]">
      <Editor
        height="100%"
        width="100%"
        language={getMonacoLanguage(language)}
        value={code}
        theme="vs-dark"
        onChange={(val) => onChange(val || "")}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex items-center justify-center h-full gap-2 text-xs font-mono text-zinc-400 bg-zinc-950">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Initializing Monaco Editor...</span>
          </div>
        }
        options={{
          fontSize,
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
          fontLigatures: true,
          lineNumbers: "on",
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: false,
          automaticLayout: true,
          minimap: { enabled: false },
          tabSize: 2,
          autoIndent: "full",
          formatOnPaste: true,
          formatOnType: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          folding: true,
          renderLineHighlight: "all",
          bracketPairColorization: { enabled: true },
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
