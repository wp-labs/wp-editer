import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
  snippetCompletion,
} from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { EditorState } from '@codemirror/state';
import { StreamLanguage } from '@codemirror/language';
import {
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from '@codemirror/view';
import { oneDark } from '@codemirror/theme-one-dark';
import styles from './CodeJarEditor.module.css';

const WPL_KEYWORDS = new Set([
  'package',
  'rule',
  'plg_pipe',
  'alt',
  'opt',
  'some_of',
  'seq',
  'order',
  'tag',
  'copy_raw',
  'include',
  'macro',
  'decode',
  'unquote',
  'base64',
  'hex',
  'unescape',
]);
const WPL_TYPES = new Set([
  'auto',
  'bool',
  'chars',
  'symbol',
  'peek_symbol',
  'digit',
  'float',
  '_',
  'sn',
  'time',
  'time/clf',
  'time_iso',
  'time_3339',
  'time_2822',
  'time_timestamp',
  'ip',
  'ip_net',
  'domain',
  'email',
  'port',
  'hex',
  'base64',
  'kv',
  'json',
  'exact_json',
  'url',
  'proto_text',
  'obj',
  'id_card',
  'mobile_phone',
  'array',
  'array/ip',
]);
const WPL_FUNCTIONS = new Set([
  'take',
  'last',
  'f_has',
  'f_chars_has',
  'f_chars_not_has',
  'f_chars_in',
  'f_digit_has',
  'f_digit_in',
  'f_ip_in',
  'has',
  'chars_has',
  'chars_not_has',
  'chars_in',
  'digit_has',
  'digit_in',
  'ip_in',
  'json_unescape',
  'base64_decode',
]);
const WPL_BUILTINS = new Set(['http/request', 'http/agent']);

const WPL_KEYWORD_COMPLETIONS = [
  'plg_pipe',
  'id',
  'alt',
  'opt',
  'some_of',
  'seq',
  'order',
  'tag',
  'copy_raw',
  'include',
  'macro',
  'decode',
  'unquote',
  'base64',
  'hex',
  'unescape',
].map((label) => ({ label, type: 'keyword', detail: '关键字' }));

const WPL_TYPE_COMPLETIONS = Array.from(WPL_TYPES).map((label) => ({
  label,
  type: 'type',
  detail: '字段类型',
}));

const WPL_FUNCTION_COMPLETIONS = Array.from(WPL_FUNCTIONS).map((label) => ({
  label,
  type: 'function',
  detail: '字段函数',
}));

const WPL_BUILTIN_COMPLETIONS = Array.from(WPL_BUILTINS).map((label) => ({
  label,
  type: 'constant',
  detail: '内置字段',
}));

const wplLanguage = StreamLanguage.define({
  token(stream) {
    if (stream.eatSpace()) {
      return null;
    }
    const ch = stream.peek();
    if (ch === '"') {
      stream.next();
      while (!stream.eol()) {
        if (stream.next() === '"' && !stream.match(/\\$/, false)) {
          break;
        }
      }
      return 'string';
    }
    if (stream.match(/-?\d+(\.\d+)?/)) {
      return 'number';
    }
    if (stream.match(/[\w/]+/)) {
      const word = stream.current();
      if (WPL_KEYWORDS.has(word)) return 'keyword';
      if (WPL_TYPES.has(word)) return 'typeName';
      if (WPL_FUNCTIONS.has(word)) return 'function';
      if (WPL_BUILTINS.has(word)) return 'atom';
      return 'variableName';
    }
    if (stream.match(/[{}()[\],|:]/)) {
      return 'operator';
    }
    stream.next();
    return null;
  },
});

const WPL_COMPLETIONS = [
  snippetCompletion(['package /${path}/ {', '}'].join('\n'), {
    label: 'package',
    type: 'keyword',
    detail: '包定义',
    info: '定义 WPL 包路径与作用域。',
  }),
  snippetCompletion(['rule ${name} {(', ')}'].join('\n'), {
    label: 'rule',
    type: 'keyword',
    detail: '规则定义',
    info: '定义规则名称与规则体。',
  }),
  { label: '_', type: 'variable', detail: '占位符' },
  ...WPL_KEYWORD_COMPLETIONS,
  ...WPL_TYPE_COMPLETIONS,
  ...WPL_FUNCTION_COMPLETIONS,
  ...WPL_BUILTIN_COMPLETIONS,
];

const wplCompletionSource = (context) => {
  const word = context.matchBefore(/[\w/]+/);
  if (!word && !context.explicit) {
    return null;
  }
  const from = word ? word.from : context.pos;
  return {
    from,
    options: WPL_COMPLETIONS,
    validFor: /[\w/]+/,
  };
};

const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
  },
  '.cm-content': {
    fontFamily:
      '"Fira Code", SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: '13px',
    lineHeight: '1.6',
    padding: '14px 16px',
  },
  '.cm-scroller': {
    overflow: 'auto',
  },
  '.cm-gutters': {
    backgroundColor: '#0b1224',
    color: '#94a3b8',
    borderRight: '1px solid rgba(226, 232, 240, 0.1)',
    minWidth: '48px',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 12px 0 10px',
    textAlign: 'right',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
  },
  '.cm-keyword': {
    color: '#7dd3fc',
  },
  '.cm-typeName': {
    color: '#facc15',
  },
  '.cm-function': {
    color: '#f472b6',
  },
  '.cm-atom': {
    color: '#a5b4fc',
  },
  '.cm-string': {
    color: '#86efac',
  },
  '.cm-number': {
    color: '#fde047',
  },
  '.cm-operator': {
    color: '#cbd5f5',
  },
  '.cm-variableName': {
    color: '#e2e8f0',
  },
});

const CodeJarEditor = forwardRef((props, ref) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getValue: () => viewRef.current?.state.doc.toString() || '',
    setValue: (value) => {
      const view = viewRef.current;
      if (!view) return;
      const nextValue = value || '';
      const currentValue = view.state.doc.toString();
      if (currentValue !== nextValue) {
        view.dispatch({
          changes: { from: 0, to: currentValue.length, insert: nextValue },
        });
      }
    },
  }));

  useEffect(() => {
    if (!editorRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        props.onChange?.(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: props.value || '',
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        EditorView.lineWrapping,
        EditorState.tabSize.of(2),
        history(),
        wplLanguage,
        autocompletion({ override: [wplCompletionSource] }),
        closeBrackets(),
        keymap.of([
          ...completionKeymap,
          ...closeBracketsKeymap,
          indentWithTab,
          ...historyKeymap,
          ...defaultKeymap,
        ]),
        oneDark,
        editorTheme,
        updateListener,
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || props.value === undefined) return;
    const nextValue = props.value || '';
    const currentValue = view.state.doc.toString();
    if (currentValue !== nextValue) {
      view.dispatch({
        changes: { from: 0, to: currentValue.length, insert: nextValue },
      });
    }
  }, [props.value]);

  return (
    <div className={`${styles.editor} ${props.className || ''}`}>
      <div ref={editorRef} className={styles.code} />
    </div>
  );
});

export default CodeJarEditor;
