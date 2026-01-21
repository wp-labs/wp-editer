import { EditorView } from '@codemirror/view';

export const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
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
    minWidth: '48px',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 12px 0 10px',
    textAlign: 'right',
  },
  '.cm-content .cm-highlight-keyword': {
    color: '#80F4FF !important',
  },
  '.cm-content .cm-keyword': {
    color: '#80F4FF !important',
  },
  '.cm-content .cm-highlight-type': {
    color: '#FFF2b3 !important',
  },
  '.cm-content .cm-typeName': {
    color: '#FFF2b3 !important',
  },
  '.cm-content .cm-highlight-function': {
    color: '#68BEA6 !important',
  },
  '.cm-content .cm-function': {
    color: '#68BEA6 !important',
  },
  '.cm-content .cm-highlight-atom': {
    color: '#a5b4fcff !important',
  },
  '.cm-content .cm-atom': {
    color: '#a5b4fcff !important',
  },
  '.cm-content .cm-highlight-string': {
    color: '#86efac !important',
  },
  '.cm-content .cm-string': {
    color: '#86efac !important',
  },
  '.cm-content .cm-highlight-number': {
    color: '#fde047 !important',
  },
  '.cm-content .cm-number': {
    color: '#fde047 !important',
  },
  '.cm-content .cm-highlight-operator': {
    color: '#cbd5f5 !important',
  },
  '.cm-content .cm-operator': {
    color: '#cbd5f5 !important',
  },
  '.cm-content .cm-highlight-variable': {
    color: '#e2e8f0 !important',
  },
  '.cm-content .cm-variableName': {
    color: '#e2e8f0 !important',
  },
  '.cm-tooltip-autocomplete': {
    backgroundColor: '#0b1224',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    boxShadow: '0 12px 24px rgba(15, 23, 42, 0.45)',
  },
  '.cm-tooltip-autocomplete .cm-completionList': {
    backgroundColor: 'transparent',
  },
  '.cm-tooltip-autocomplete ul li': {
    color: '#94a3b8',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  '.cm-tooltip-autocomplete ul li:hover, .cm-tooltip-autocomplete .cm-completionItem:hover': {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected], .cm-tooltip-autocomplete .cm-completionItem[aria-selected]': {
    backgroundColor: 'rgba(59, 130, 246, 0.3) !important',
    color: '#f8fafc !important',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected] .cm-completionMatchedText, .cm-tooltip-autocomplete .cm-completionItem[aria-selected] .cm-completionMatchedText': {
    color: '#80F4FF !important',
  },
  '.cm-tooltip-autocomplete .cm-completionMatchedText': {
    color: '#80F4FF',
  },
});
