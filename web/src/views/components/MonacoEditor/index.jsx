import './monaco-workers';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import styles from './Editor.module.css';

// 配置 Monaco Editor 使用本地资源而非 CDN
loader.config({ monaco });

const MonacoEditor = forwardRef((props, ref) => {
  const editorRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      return editorRef.current?.getValue() || '';
    },
    setValue: (value) => {
      editorRef.current?.setValue(value);
    },
  }));

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  return (
    <Editor
      className={styles.Editor}
      {...props}
      onMount={handleEditorDidMount}
      options={{
        ...props.options,
        // 启用代码折叠功能
        folding: true,
        // 始终显示折叠按钮
        showFoldingControls: 'always',
        // 启用代码折叠高亮
        foldingHighlight: true,
        // 使用缩进进行代码折叠
        foldingStrategy: 'indentation',
      }}
    />
  );
});

export default MonacoEditor;
