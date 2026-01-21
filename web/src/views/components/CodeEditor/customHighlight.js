import { HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';

export const customHighlight = HighlightStyle.define([
  {
    tag: tags.keyword,
    class: 'cm-highlight-keyword',
  },
  {
    tag: tags.typeName,
    class: 'cm-highlight-type',
  },
  {
    tag: tags.function,
    class: 'cm-highlight-function',
  },
  {
    tag: tags.atom,
    class: 'cm-highlight-atom',
  },
  {
    tag: tags.string,
    class: 'cm-highlight-string',
  },
  {
    tag: tags.number,
    class: 'cm-highlight-number',
  },
  {
    tag: tags.operator,
    class: 'cm-highlight-operator',
  },
  {
    tag: tags.variableName,
    class: 'cm-highlight-variable',
  },
]);
