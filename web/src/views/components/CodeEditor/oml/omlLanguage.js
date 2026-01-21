import { snippetCompletion } from '@codemirror/autocomplete';
import { StreamLanguage } from '@codemirror/language';
import { Decoration, MatchDecorator, ViewPlugin } from '@codemirror/view';
import OML_COMPLETION_TABLE_ZH from './omlCompletionTable';
import OML_COMPLETION_TABLE_EN from './omlCompletionTable.en';
import { buildCompletionInfo, getCompletionLabels } from '../completionLabels';

const LANGUAGE_DEFINITIONS = {
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

const OML_DEFINITION = LANGUAGE_DEFINITIONS.oml;
const OML_KEYWORDS = new Set(OML_DEFINITION.keywords);
const OML_TYPES = new Set(OML_DEFINITION.types);
const OML_FUNCTIONS = new Set(OML_DEFINITION.functions);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const OML_FUNCTION_PATTERN = new RegExp(
  `\\b(?:${[...OML_FUNCTIONS].map((name) => escapeRegex(name)).join('|')})\\b`,
  'g',
);

export const OML_COMPLETION_VALID_FOR = /[\w/:\[\]]+|\|/;

export const buildOmlCompletionOptions = (lang) => {
  const labels = getCompletionLabels(lang);
  const table = lang === 'en-US' ? OML_COMPLETION_TABLE_EN : OML_COMPLETION_TABLE_ZH;
  return table.map((item) => {
    const description = item.description;
    return snippetCompletion(item.insertText, {
      label: item.label,
      type: 'function',
      detail: description,
      info: buildCompletionInfo(labels, description, item.example),
    });
  });
};

export const omlLanguage = StreamLanguage.define({
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
      const hasCall = stream.match(/\s*\(/, false);
      if (hasCall && (OML_FUNCTIONS.has(word) || OML_FUNCTIONS.has(normalized) || word.includes('::'))) {
        return 'function';
      }
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

const omlFunctionDecorator = new MatchDecorator({
  regexp: /\b[\w:]+(?=\s*\()/g,
  decoration: Decoration.mark({ class: 'cm-function' }),
});

const omlFunctionNameDecorator = new MatchDecorator({
  regexp: OML_FUNCTION_PATTERN,
  decoration: Decoration.mark({ class: 'cm-function' }),
});

export const omlFunctionHighlighter = ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.decorations = omlFunctionDecorator.createDeco(view);
    }

    update(update) {
      this.decorations = omlFunctionDecorator.updateDeco(update, this.decorations);
    }
  },
  {
    decorations: (instance) => instance.decorations,
  },
);

export const omlFunctionNameHighlighter = ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.decorations = omlFunctionNameDecorator.createDeco(view);
    }

    update(update) {
      this.decorations = omlFunctionNameDecorator.updateDeco(update, this.decorations);
    }
  },
  {
    decorations: (instance) => instance.decorations,
  },
);
