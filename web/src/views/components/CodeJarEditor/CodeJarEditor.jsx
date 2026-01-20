import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
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
import OML_COMPLETION_TABLE_ZH from './omlCompletionTable';
import OML_COMPLETION_TABLE_EN from './omlCompletionTable.en';
import WPL_COMPLETION_TABLE_ZH from './wplCompletionTable';
import WPL_COMPLETION_TABLE_EN from './wplCompletionTable.en';
import { useTranslation } from 'react-i18next';

const LANGUAGE_DEFINITIONS = {
  wpl: {
    keywords: [
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
    ],
    types: [
      'peek_symbol',
      'symbol',
      'bool',
      'chars',
      'digit',
      'float',
      'time_3339',
      'time_2822',
      'time/clf',
      'time_timestamp',
      'ip',
      'ip_net',
      'port',
      'kvarr',
      'json',
      'http/request',
      'http/status',
      'http/agent',
      'http/method',
      'hex',
      'base64',
      'sn',
      '_',
    ],
    functions: [
      'decode/base64',
      'decode/hex',
      'unquote/unescape',
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
      'ip_in',
      'json_unescape',
      'base64_decode',
    ],
    constants: [],
    placeholders: [],
  },
  oml: {
    keywords: [],
    types: [],
    functions: [
      'chars',
      'digit',
      'read',
      'option',
      'take',
      'Now::time',
      'Now::date',
      'Now::hour',
      'match',
      'Time::to_ts_zone',
      'Time::to_ts',
      'Time::to_ts_ms',
      'Time::to_ts_us',
      'base64_decode',
      'base64_encode',
      'html_escape',
      'html_unescape',
      'json_escape',
      'json_unescape',
      'str_escape',
      'to_str',
      'to_json',
      'ip4_to_int',
      'nth',
      'get',
      'path',
      'url',
      'skip_empty',
      'pipe',
      'fmt',
      'object',
      'collect',
    ],
    constants: [],
    placeholders: [],
  },
};

const COMPLETION_LABELS = {
  'zh-CN': {
    description: '说明',
    example: '示例',
    packageDetail: '包定义',
    packageInfo: '定义 WPL 包路径与作用域。',
    ruleDetail: '规则定义',
    ruleInfo: '定义规则名称与规则体。',
  },
  'en-US': {
    description: 'Description',
    example: 'Example',
    packageDetail: 'Package',
    packageInfo: 'Define WPL package path and scope.',
    ruleDetail: 'Rule',
    ruleInfo: 'Define rule name and body.',
  },
};

const getCompletionLabels = (lang) => COMPLETION_LABELS[lang] || COMPLETION_LABELS['zh-CN'];

const buildCompletionInfo = (labels, description, example) => {
  const lines = [];
  if (description) lines.push(`${labels.description}：${description}`);
  if (example) lines.push(`${labels.example}：${example}`);
  return lines.length ? lines.join('\n') : undefined;
};

const resolveDescription = (item) => item.description;

const buildWplCompletionOptions = (lang) => {
  const labels = getCompletionLabels(lang);
  const table = lang === 'en-US' ? WPL_COMPLETION_TABLE_EN : WPL_COMPLETION_TABLE_ZH;
  return [
    snippetCompletion(['package /${path}/ {', '  $0', '}'].join('\n'), {
      label: 'package',
      type: 'keyword',
      detail: labels.packageDetail,
      info: labels.packageInfo,
    }),
    snippetCompletion(['rule ${name} {(', '  $0', ')}'].join('\n'), {
      label: 'rule',
      type: 'keyword',
      detail: labels.ruleDetail,
      info: labels.ruleInfo,
    }),
    ...table.map((item) => {
      const description = resolveDescription(item);
      return snippetCompletion(item.insertText, {
        label: item.label,
        type: item.kind,
        detail: description,
        info: buildCompletionInfo(labels, description, item.example),
      });
    }),
  ];
};

const buildOmlCompletionOptions = (lang) => {
  const labels = getCompletionLabels(lang);
  const table = lang === 'en-US' ? OML_COMPLETION_TABLE_EN : OML_COMPLETION_TABLE_ZH;
  return table.map((item) => {
    const description = resolveDescription(item);
    return snippetCompletion(item.insertText, {
      label: item.label,
      type: 'function',
      detail: description,
      info: buildCompletionInfo(labels, description, item.example),
    });
  });
};

const createCompletionSource = (options, validFor) => (context) => {
  const word = context.matchBefore(validFor);
  if (!word && !context.explicit) {
    return null;
  }
  const from = word ? word.from : context.pos;
  return {
    from,
    options,
    validFor,
  };
};

const WPL_DEFINITION = LANGUAGE_DEFINITIONS.wpl;
const WPL_KEYWORDS = new Set(WPL_DEFINITION.keywords);
const WPL_TYPES = new Set(WPL_COMPLETION_TABLE_ZH.filter((item) => item.kind === 'type').map((item) => item.label));
const WPL_FUNCTIONS = new Set(
  WPL_COMPLETION_TABLE_ZH.filter((item) => item.kind === 'function').map((item) => item.label),
);
const WPL_BUILTINS = new Set(WPL_DEFINITION.constants);

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
      if (WPL_FUNCTIONS.has(word) || word.startsWith('plg_pipe/')) return 'function';
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

const WPL_COMPLETION_VALID_FOR = /[\w/]+|\|/;

const OML_DEFINITION = LANGUAGE_DEFINITIONS.oml;
const OML_KEYWORDS = new Set(OML_DEFINITION.keywords);
const OML_TYPES = new Set(OML_DEFINITION.types);
const OML_FUNCTIONS = new Set(OML_DEFINITION.functions);

const OML_COMPLETION_VALID_FOR = /[\w/:\[\]]+|\|/;

const omlLanguage = StreamLanguage.define({
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
    if (stream.match(/[\w/:]+/)) {
      const word = stream.current();
      const normalized = word.replace(/:+$/, '');
      if (OML_KEYWORDS.has(word) || OML_KEYWORDS.has(normalized)) return 'keyword';
      if (OML_TYPES.has(word) || OML_TYPES.has(normalized)) return 'typeName';
      if (OML_FUNCTIONS.has(word) || OML_FUNCTIONS.has(normalized)) return 'function';
      return 'variableName';
    }
    if (stream.match(/[{}()[\],|:]/)) {
      return 'operator';
    }
    stream.next();
    return null;
  },
});

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
  '.cm-content .cm-keyword': {
    color: '#3b82f6 !important',
  },
  '.cm-content .ͼp': {
    color: '#3b82f6 !important',
  },
  '.cm-typeName': {
    color: '#facc15',
  },
  '.cm-function': {
    color: '#7281f4ff',
  },
  '.cm-atom': {
    color: '#a5b4fcff',
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
  const language = props.language || 'plain';
  const { i18n } = useTranslation();
  const uiLanguage = i18n.language;
  const wplCompletionOptions = useMemo(() => buildWplCompletionOptions(uiLanguage), [uiLanguage]);
  const omlCompletionOptions = useMemo(() => buildOmlCompletionOptions(uiLanguage), [uiLanguage]);
  const wplCompletionSource = useMemo(
    () => createCompletionSource(wplCompletionOptions, WPL_COMPLETION_VALID_FOR),
    [wplCompletionOptions],
  );
  const omlCompletionSource = useMemo(
    () => createCompletionSource(omlCompletionOptions, OML_COMPLETION_VALID_FOR),
    [omlCompletionOptions],
  );

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

    const extensions = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightActiveLine(),
      EditorView.lineWrapping,
      EditorState.tabSize.of(2),
      history(),
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
    ];

    if (language === 'wpl') {
      extensions.splice(6, 0, wplLanguage, autocompletion({ override: [wplCompletionSource] }));
    }
    if (language === 'oml') {
      extensions.splice(6, 0, omlLanguage, autocompletion({ override: [omlCompletionSource] }));
    }

    const state = EditorState.create({
      doc: props.value || '',
      extensions,
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
  }, [language, uiLanguage, wplCompletionSource, omlCompletionSource]);

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
