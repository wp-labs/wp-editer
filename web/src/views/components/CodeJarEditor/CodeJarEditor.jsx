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

const WPL_COMPLETION_INFO = {
  peek_symbol: { description: '预读匹配但不消费输入', example: 'peek_symbol(peek_symbol)' },
  symbol: { description: '精确匹配指定字符串', example: 'symbol(symbol)' },
  bool: { description: '布尔值，匹配 true/false', example: 'true' },
  chars: { description: '字符串，支持引号或裸字符串', example: '"hello" / hello' },
  digit: { description: '整数', example: '123 / -456' },
  float: { description: '浮点数', example: '3.14 / -0.5' },
  time_3339: { description: 'RFC3339/ISO 8601 时间', example: '2026-01-19T12:34:56Z' },
  time_2822: { description: 'RFC2822 邮件时间格式', example: 'Mon, 07 Jul 2025 09:20:32 +0000' },
  'time/clf': { description: 'Common Log Format 时间', example: '[06/Aug/2019:12:12:19 +0800]' },
  time_timestamp: { description: 'Unix 秒级时间戳', example: '1647849600' },
  ip: { description: 'IPv4/IPv6 地址', example: '192.168.1.100 / ::1' },
  ip_net: { description: 'CIDR 网段', example: '192.168.0.0/24' },
  port: { description: '端口号（1-65535）', example: '8080' },
  kvarr: { description: '键值对 key=value', example: 'name=test' },
  json: { description: 'JSON 对象', example: '{"strict":true}' },
  'http/request': { description: 'HTTP 请求行', example: '"GET /api/users HTTP/1.1"' },
  'http/status': { description: 'HTTP 状态码', example: '200' },
  'http/agent': { description: 'User-Agent', example: '"Mozilla/5.0"' },
  'http/method': { description: 'HTTP 方法', example: '"POST"' },
  hex: { description: '十六进制字符串', example: '0x1A2B / 1A2B' },
  base64: { description: 'Base64 编码字符串', example: 'YmFzZTY0ZGF0YQ==' },
  sn: { description: '字母数字序列号', example: 'ABC123XYZ' },
  _: { description: '文档未给出详解', example: '文档未提供' },
  'decode/base64': { description: '对整行 Base64 解码', example: '|decode/base64|' },
  'decode/hex': { description: '对整行十六进制解码', example: '|decode/hex|' },
  'unquote/unescape': { description: '移除引号并还原转义', example: '|unquote/unescape|' },
  plg_pipe: { description: '自定义预处理扩展', example: '|plg_pipe/dayu|' },
  take: { description: '选择指定字段为活跃字段', example: '|take(name)|' },
  last: { description: '选择最后一个字段为活跃字段', example: '|last()|' },
  f_has: { description: '检查字段是否存在', example: '|f_has(status)|' },
  f_chars_has: { description: '检查字段值等于字符串', example: '|f_chars_has(status, success)|' },
  f_chars_not_has: { description: '检查字段值不等于字符串', example: '|f_chars_not_has(level, error)|' },
  f_chars_in: { description: '检查字段值在字符串列表', example: '|f_chars_in(method, [GET, POST])|' },
  f_digit_has: { description: '检查字段值等于数字', example: '|f_digit_has(code, 200)|' },
  f_digit_in: { description: '检查字段值在数字列表', example: '|f_digit_in(status, [200, 201])|' },
  f_ip_in: { description: '检查 IP 在列表', example: '|f_ip_in(client_ip, [127.0.0.1])|' },
  has: { description: '检查活跃字段存在', example: '|take(name)| has()|' },
  chars_has: { description: '检查活跃字段等于字符串', example: '|take(status)| chars_has(success)|' },
  chars_not_has: { description: '检查活跃字段不等于字符串', example: '|take(level)| chars_not_has(error)|' },
  chars_in: { description: '检查活跃字段在字符串列表', example: '|take(method)| chars_in([GET, POST])|' },
  digit_has: { description: '检查活跃字段等于数字', example: '|take(code)| digit_has(200)|' },
  ip_in: { description: '检查活跃 IP 在列表', example: '|take(client_ip)| ip_in([127.0.0.1])|' },
  json_unescape: { description: 'JSON 反转义', example: '|take(message)| json_unescape()|' },
  base64_decode: { description: 'Base64 解码', example: '|take(payload)| base64_decode()|' },
};

const buildCompletionInfo = (label, fallbackDetail) => {
  const info = WPL_COMPLETION_INFO[label];
  if (!info) {
    return fallbackDetail ? `说明：${fallbackDetail}` : undefined;
  }
  const lines = [];
  if (info.description) lines.push(`说明：${info.description}`);
  if (info.example) lines.push(`示例：${info.example}`);
  return lines.join('\n');
};

const buildCompletionItems = (definition, infoMap = {}) => {
  const keywordItems = definition.keywords.map((label) => ({
    label,
    type: 'keyword',
    detail: '关键字',
    info: buildCompletionInfo(label, '关键字'),
  }));
  const typeItems = definition.types.map((label) => ({
    label,
    type: 'type',
    detail: infoMap[label]?.description || '字段类型',
    info: buildCompletionInfo(label),
  }));
  const functionItems = definition.functions.map((label) => ({
    label,
    type: 'function',
    detail: infoMap[label]?.description || '字段函数',
    info: buildCompletionInfo(label),
  }));
  const constantItems = definition.constants.map((label) => ({
    label,
    type: 'constant',
    detail: '内置字段',
    info: buildCompletionInfo(label, '内置字段'),
  }));
  const placeholderItems = definition.placeholders.map((label) => ({
    label,
    type: 'variable',
    detail: '占位符',
    info: buildCompletionInfo(label, '占位符'),
  }));
  return [...keywordItems, ...typeItems, ...functionItems, ...constantItems, ...placeholderItems];
};

const WPL_DEFINITION = LANGUAGE_DEFINITIONS.wpl;
const WPL_KEYWORDS = new Set(WPL_DEFINITION.keywords);
const WPL_TYPES = new Set(WPL_DEFINITION.types);
const WPL_FUNCTIONS = new Set(WPL_DEFINITION.functions);
const WPL_BUILTINS = new Set(WPL_DEFINITION.constants);
const WPL_COMPLETION_ITEMS = buildCompletionItems(WPL_DEFINITION, WPL_COMPLETION_INFO).filter(
  (item) => !['package', 'rule', 'plg_pipe'].includes(item.label),
);

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
  snippetCompletion('plg_pipe/${name}', {
    label: 'plg_pipe',
    type: 'function',
    detail: '预处理扩展',
    info: buildCompletionInfo('plg_pipe'),
  }),
  ...WPL_COMPLETION_ITEMS,
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

const OML_DEFINITION = LANGUAGE_DEFINITIONS.oml;
const OML_KEYWORDS = new Set(OML_DEFINITION.keywords);
const OML_TYPES = new Set(OML_DEFINITION.types);
const OML_FUNCTIONS = new Set(OML_DEFINITION.functions);

const OML_COMPLETION_TABLE = [
  {
    label: 'chars()',
    description: '直接创建常量值',
    example: 'chars(13)',
    insertText: 'chars(${chars})',
  },
  {
    label: 'digit()',
    description: '直接创建常量值',
    example: 'digit(13)',
    insertText: 'digit(${digit})',
  },
  {
    label: 'read',
    description: '简单取值',
    example: 'read(simple_chars)',
    insertText: 'read(${Variable})',
  },
  {
    label: 'read(keys)',
    description: '通配符批量操作',
    example: 'a_name_fields = read(keys:[A*/name])',
    insertText: 'a_name_fields = read(${keys:[A*/name]})',
  },
  {
    label: 'read',
    description: '字段不存在时使用默认值',
    example: 'read(optional_field) { _ : chars(DEFAULT_VALUE) }',
    insertText: 'read(${field}) { _ : chars(DEFAULT) }',
  },
  {
    label: 'option:[]',
    description: '选择取值（按顺序尝试多个字段）',
    example: 'read(option:[select_one, select_two])',
    insertText: 'option:[${select_one}]',
  },
  {
    label: 'take',
    description: '破坏性读取并移除源字段',
    example: 'field_taken = take(source_field)',
    insertText: 'take(${source_field})',
  },
  {
    label: 'take',
    description: 'take失败使用默认值',
    example: 'field_taken_again = take(source_field) { _ : chars(already_taken) }',
    insertText: 'take(${source_field}) { _ : chars(DEFAULT) }',
  },
  {
    label: 'take()',
    description: '取所有字段',
    example: 'all_fields = take()',
    insertText: 'all_fields = take()',
  },
  {
    label: 'take(keys)',
    description: '通配符批量操作',
    example: 'path_fields = take(keys:[*/path])',
    insertText: 'path_fields = take(keys:[*/path])',
  },
  {
    label: 'Now::time()',
    description: '获取当前完整时间',
    example: 'current_time = Now::time()',
    insertText: 'current_time = Now::time()',
  },
  {
    label: 'Now::date()',
    description: '获取当前日期',
    example: 'current_date = Now::date()',
    insertText: 'Now::date()',
  },
  {
    label: 'Now::hour()',
    description: '获取当前小时',
    example: 'current_hour = Now::hour()',
    insertText: 'Now::hour()',
  },
  {
    label: 'match',
    description: '范围判断',
    example: 'num_range = match read(option:[num_range]) { in (digit(0), digit(1000)) => read(num_range) }',
    insertText: 'match read(option:[${num_range}]) { in (digit(0), digit(1000)) => read(num_range) }',
  },
  {
    label: 'match',
    description: '字段匹配',
    example: 'is_enabled : digit = match read(enabled) { bool(true) => digit(1) }',
    insertText: 'match read(${field}) {}',
  },
  {
    label: 'match',
    description: '双字段组合匹配',
    example:
      'location : chars = match (read(city1), read(city2)) { (chars(beijing), chars(shanghai)) => chars(east_region) }',
    insertText:
      'location : chars = match (read(city1), read(city2)) { (chars(beijing), chars(shanghai)) => chars(east_region) }',
  },
  {
    label: 'match + !',
    description: '否定条件匹配',
    example: 'valid_status = match read(status) { !chars(error) => chars(ok) }',
    insertText: 'match read(status) { !chars(!{error}) => chars(ok) }',
  },
  {
    label: 'Time::to_ts_zone',
    description: '时间转换（时区）',
    example: 'timestamp_zone = pipe read(timestamp_zone) | Time::to_ts_zone(0, ms)',
    insertText: 'Time::to_ts_zone(${0}, ms)',
  },
  {
    label: 'Time::to_ts',
    description: '时间转换（秒级）',
    example: 'timestamp_s = pipe read(timestamp_zone) | Time::to_ts',
    insertText: 'Time::to_ts',
  },
  {
    label: 'Time::to_ts_ms',
    description: '时间转换（毫秒）',
    example: 'timestamp_ms = pipe @current_time | Time::to_ts_ms',
    insertText: 'Time::to_ts_ms',
  },
  {
    label: 'Time::to_ts_us',
    description: '时间转换（微秒）',
    example: 'timestamp_us = pipe @current_time | Time::to_ts_us',
    insertText: 'Time::to_ts_us',
  },
  {
    label: 'base64_decode',
    description: 'Base64 解码',
    example: 'base64_decoded = pipe read(base64) | base64_decode(Utf8)',
    insertText: 'base64_decode(${Utf8})',
  },
  {
    label: 'base64_encode',
    description: 'Base64 编码',
    example: 'base64_encoded = pipe read(base64) | base64_encode',
    insertText: 'base64_encode',
  },
  {
    label: 'html_escape',
    description: 'HTML 转义',
    example: 'html_escaped = pipe read(html) | html_escape',
    insertText: 'html_escape',
  },
  {
    label: 'html_unescape',
    description: 'HTML 反转义',
    example: 'html_unescaped = pipe read(html) | html_unescape',
    insertText: 'html_unescape',
  },
  {
    label: 'json_escape',
    description: 'JSON 转义',
    example: 'json_escaped = pipe read(json_escape) | json_escape',
    insertText: 'json_escape',
  },
  {
    label: 'json_unescape',
    description: 'JSON 反转义',
    example: 'json_unescaped = pipe @json_escaped | json_unescape',
    insertText: 'json_unescape',
  },
  {
    label: 'str_escape',
    description: '字符串转义',
    example: 'str_escaped = pipe read(str) | str_escape',
    insertText: 'str_escape',
  },
  {
    label: 'to_str',
    description: '转为字符串',
    example: 'to_str_result = pipe read(str) | to_str',
    insertText: 'to_str',
  },
  {
    label: 'to_json',
    description: '转为 JSON',
    example: 'array_json = pipe read(array_str) | to_json',
    insertText: 'to_json',
  },
  {
    label: 'ip4_to_int',
    description: 'IPv4 转整数',
    example: 'ip_to_int = pipe read(simple_ip) | ip4_to_int',
    insertText: 'ip4_to_int',
  },
  {
    label: 'nth',
    description: '数组取元素',
    example: 'array_first = pipe read(array_str) | nth(0)',
    insertText: 'nth(${0})',
  },
  {
    label: 'get',
    description: '对象嵌套取值',
    example: 'obj_nested = pipe read(obj) | nth(0) | get(one/two)',
    insertText: 'get(${one/two})',
  },
  {
    label: 'path(name)',
    description: '提取文件名',
    example: 'file_name = pipe read(path) | path(name)',
    insertText: 'path(name)',
  },
  {
    label: 'path(path)',
    description: '提取文件路径',
    example: 'file_path = pipe read(path) | path(path)',
    insertText: 'path(path)',
  },
  {
    label: 'url(domain)',
    description: '提取 URL domain',
    example: 'url_domain = pipe read(url) | url(domain)',
    insertText: 'url(domain)',
  },
  {
    label: 'url(host)',
    description: '提取 URL host',
    example: 'url_host = pipe read(url) | url(host)',
    insertText: 'url(host)',
  },
  {
    label: 'url(uri)',
    description: '提取 URL uri',
    example: 'url_uri = pipe read(url) | url(uri)',
    insertText: 'url(uri)',
  },
  {
    label: 'url(path)',
    description: '提取 URL path',
    example: 'url_path = pipe read(url) | url(path)',
    insertText: 'url(path)',
  },
  {
    label: 'url(params)',
    description: '提取 URL params',
    example: 'url_params = pipe read(url) | url(params)',
    insertText: 'url(params)',
  },
  {
    label: 'skip_empty',
    description: '跳过空值',
    example: 'skip_empty_result = pipe read(empty_chars) | skip_empty',
    insertText: 'skip_empty',
  },
  {
    label: 'pipe',
    description: '流处理',
    example: 'pipe simple_transform = read(data) | to_json',
    insertText: 'pipe',
  },
  {
    label: 'fmt',
    description: '字符串格式化',
    example: 'splice = fmt("{one}:{two}|{three}:{four}", read(one), read(two), read(three), read(four))',
    insertText: 'fmt',
  },
  {
    label: 'object',
    description: '对象创建',
    example: 'extends = object { extend1, extend2 = read() }',
    insertText: 'object { }',
  },
  {
    label: 'collect',
    description: '数组收集',
    example: 'collected_ports : array = collect read(keys:[sport, dport, extra_port])',
    insertText: 'collect read(keys:[${sport}])',
  },
  {
    label: 'collect + 通配符',
    description: '通配符收集',
    example: 'wildcard_items : array = collect take(keys:[details[*]/process_name])',
    insertText: 'collect take(keys:[${details[*]/process_name}])',
  },
];

const OML_COMPLETIONS = OML_COMPLETION_TABLE.map((item) =>
  snippetCompletion(item.insertText, {
    label: item.label,
    type: 'function',
    detail: item.description,
    info: `说明：${item.description}\n示例：${item.example}`,
  }),
);

const omlCompletionSource = (context) => {
  const word = context.matchBefore(/[\w/:\[\]]+/);
  if (!word && !context.explicit) {
    return null;
  }
  const from = word ? word.from : context.pos;
  return {
    from,
    options: OML_COMPLETIONS,
    validFor: /[\w/:\[\]]+/,
  };
};

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
  const language = props.language || 'plain';

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
  }, [language]);

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
