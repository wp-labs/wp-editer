/// WPL 代码格式化器：通过轻量词法扫描与缩进规则生成稳定输出。
pub struct WplFormatter {
    indent: usize,
}

impl Default for WplFormatter {
    fn default() -> Self {
        Self::new()
    }
}

impl WplFormatter {
    /// 默认 4 空格缩进。
    pub fn new() -> Self {
        Self { indent: 4 }
    }

    /// 自定义缩进宽度（单位：空格）。
    pub fn with_indent(indent: usize) -> Self {
        Self {
            indent: indent.max(1),
        }
    }

    /// 出错时返回原文，避免影响调用方。
    pub fn format_content(&self, content: &str) -> String {
        match self.format(content) {
            Ok(v) => v,
            Err(_) => content.to_string(),
        }
    }

    fn format(&self, content: &str) -> Result<String, WplFormatError> {
        let normalized = content.replace("\r\n", "\n").replace('\r', "\n");
        let mut out = String::with_capacity(normalized.len() + 64);
        let chars: Vec<char> = normalized.chars().collect();

        const RAW_FUNCS: &[&str] = &["symbol", "f_chars_not_has", "f_chars_has", "kv","f_chars_in"];

        let mut i = 0usize;
        let mut indent = 0usize;
        let mut start_of_line = true;

        while i < chars.len() {
            let c = chars[i];
            let escaped = i > 0 && chars[i - 1] == '\\';

            // 处理字符串与原始字符串，内部内容保持不变
            if c == '"' {
                let (literal, consumed) = self.read_string(&chars[i..])?;
                self.write_indent_if_needed(start_of_line, indent, &mut out)?;
                out.push_str(&literal);
                i += consumed;
                start_of_line = false;
                continue;
            }
            if c == 'r' && i + 1 < chars.len() && chars[i + 1] == '#' {
                let (literal, consumed) = self.read_raw_string(&chars[i..])?;
                self.write_indent_if_needed(start_of_line, indent, &mut out)?;
                out.push_str(&literal);
                i += consumed;
                start_of_line = false;
                continue;
            }

            // 注解块 #[...] 直接压缩为单行
            if c == '#' && i + 1 < chars.len() && chars[i + 1] == '[' {
                let (ann, consumed) = self.read_bracket_block(&chars[i..], '[', ']')?;
                self.write_indent_if_needed(start_of_line, indent, &mut out)?;
                out.push_str(
                    &ann.replace('\n', " ")
                        .split_whitespace()
                        .collect::<Vec<_>>()
                        .join(" "),
                );
                out.push('\n');
                i += consumed;
                start_of_line = true;
                continue;
            }

            // 格式占位（如 <[,]>) 保持内部逗号不拆分
            if c == '<' {
                let (fmt_block, consumed) = self.read_bracket_block(&chars[i..], '<', '>')?;
                self.write_indent_if_needed(start_of_line, indent, &mut out)?;
                out.push_str(&fmt_block);
                i += consumed;
                start_of_line = false;
                continue;
            }

            // 空白合并
            if c.is_whitespace() {
                // 连续空白折叠为单空格，行首跳过
                if c == '\n' {
                    if !start_of_line {
                        out.push('\n');
                    }
                    start_of_line = true;
                } else if !start_of_line {
                    out.push(' ');
                }
                i += 1;
                continue;
            }

            // 自定义 raw 函数：内部内容按原样保留，不解析管道/逗号
            if let Some(name_len) = self.starts_with_raw_func(&chars, i, RAW_FUNCS) {
                if let Some((block, consumed)) = self.read_raw_func_block(&chars[i..], name_len) {
                    self.write_indent_if_needed(start_of_line, indent, &mut out)?;
                    out.push_str(&block);
                    start_of_line = false;
                    i += consumed;
                    continue;
                }
            }

            // 对已转义的结构字符，按普通字符处理，避免误触发缩进/折行。
            if escaped && (c == '(' || c == ')' || c == '{' || c == '}' || c == '|' || c == ',')
            {
                self.write_indent_if_needed(start_of_line, indent, &mut out)?;
                out.push(c);
                start_of_line = false;
                i += 1;
                continue;
            }

            match c {
                '{' => {
                    self.write_indent_if_needed(start_of_line, indent, &mut out)?;
                    out.push('{');
                    out.push('\n');
                    indent += 1;
                    start_of_line = true;
                    i += 1;
                }
                '}' => {
                    indent = indent.saturating_sub(1);
                    if !start_of_line {
                        out.push('\n');
                    }
                    self.write_indent_if_needed(true, indent, &mut out)?;
                    out.push('}');
                    out.push('\n');
                    start_of_line = true;
                    i += 1;
                }
                '(' => {
                    if let Some((inner, consumed)) = self.peek_block(&chars[i..], '(', ')')
                        && !inner.contains(',')
                        && !inner.contains('|')
                    {
                        self.write_indent_if_needed(start_of_line, indent, &mut out)?;
                        out.push('(');
                        out.push_str(inner.trim());
                        out.push(')');
                        start_of_line = false;
                        i += consumed;
                        continue;
                    }
                    self.write_indent_if_needed(start_of_line, indent, &mut out)?;
                    out.push('(');
                    out.push('\n');
                    indent += 1;
                    start_of_line = true;
                    i += 1;
                }
                ')' => {
                    indent = indent.saturating_sub(1);
                    if !start_of_line {
                        out.push('\n');
                    }
                    self.write_indent_if_needed(true, indent, &mut out)?;
                    out.push(')');
                    start_of_line = false;
                    i += 1;
                }
                ',' => {
                    out.push(',');
                    out.push('\n');
                    start_of_line = true;
                    i += 1;
                }
                '|' => {
                    self.write_indent_if_needed(start_of_line, indent, &mut out)?;
                    if !start_of_line && !matches!(out.chars().last(), Some(' ' | '\n')) {
                        out.push(' ');
                    }
                    out.push('|');
                    out.push(' ');
                    while i + 1 < chars.len() && chars[i + 1].is_whitespace() {
                        i += 1;
                    }
                    start_of_line = false;
                    i += 1;
                }
                _ => {
                    self.write_indent_if_needed(start_of_line, indent, &mut out)?;
                    out.push(c);
                    start_of_line = false;
                    i += 1;
                }
            }
        }

        // 折叠多余空行
        let mut final_out = String::new();
        let mut last_blank = false;
        for line in out.trim_end().lines() {
            let blank = line.trim().is_empty();
            if blank && last_blank {
                continue;
            }
            last_blank = blank;
            final_out.push_str(line);
            final_out.push('\n');
        }

        if !final_out.ends_with('\n') {
            final_out.push('\n');
        }
        Ok(final_out)
    }

    fn write_indent_if_needed(
        &self,
        start_of_line: bool,
        indent: usize,
        buf: &mut String,
    ) -> Result<(), WplFormatError> {
        if start_of_line {
            for _ in 0..indent {
                buf.push_str(&" ".repeat(self.indent));
            }
        }
        Ok(())
    }

    fn read_string(&self, input: &[char]) -> Result<(String, usize), WplFormatError> {
        let mut out = String::new();
        let mut escaped = false;
        for (idx, ch) in input.iter().enumerate() {
            out.push(*ch);
            if escaped {
                escaped = false;
                continue;
            }
            if *ch == '\\' {
                escaped = true;
            } else if *ch == '"' && idx > 0 {
                return Ok((out, idx + 1));
            }
        }
        Err(WplFormatError::UnclosedLiteral)
    }

    fn read_raw_string(&self, input: &[char]) -> Result<(String, usize), WplFormatError> {
        let mut out = String::new();
        let mut hash_count = 0usize;
        let mut idx = 0usize;

        if input.get(idx) != Some(&'r') {
            return Err(WplFormatError::UnclosedLiteral);
        }
        out.push('r');
        idx += 1;

        while idx < input.len() && input[idx] == '#' {
            out.push('#');
            hash_count += 1;
            idx += 1;
        }
        if idx >= input.len() || input[idx] != '"' {
            return Err(WplFormatError::UnclosedLiteral);
        }
        out.push('"');
        idx += 1;

        while idx < input.len() {
            let ch = input[idx];
            out.push(ch);
            if ch == '"' {
                let mut matched = true;
                for h in 0..hash_count {
                    if idx + 1 + h >= input.len() || input[idx + 1 + h] != '#' {
                        matched = false;
                        break;
                    }
                }
                if matched {
                    for _ in 0..hash_count {
                        out.push('#');
                    }
                    return Ok((out, idx + 1 + hash_count));
                }
            }
            idx += 1;
        }
        Err(WplFormatError::UnclosedLiteral)
    }

    fn read_bracket_block(
        &self,
        input: &[char],
        open: char,
        close: char,
    ) -> Result<(String, usize), WplFormatError> {
        let mut out = String::new();
        let mut depth = 0usize;
        for (idx, ch) in input.iter().enumerate() {
            out.push(*ch);
            if *ch == open {
                depth += 1;
            } else if *ch == close {
                depth = depth.saturating_sub(1);
                if depth == 0 {
                    return Ok((out, idx + 1));
                }
            }
        }
        Err(WplFormatError::UnclosedLiteral)
    }

    fn peek_block(&self, input: &[char], open: char, close: char) -> Option<(String, usize)> {
        let mut out = String::new();
        let mut depth = 0usize;
        let mut escaped = false;
        let mut in_str = false;
        for (idx, ch) in input.iter().enumerate() {
            if escaped {
                out.push(*ch);
                escaped = false;
                continue;
            }
            match ch {
                '\\' => {
                    out.push(*ch);
                    escaped = true;
                }
                '"' => {
                    out.push(*ch);
                    in_str = !in_str;
                }
                _ if in_str => out.push(*ch),
                _ if *ch == open => {
                    depth += 1;
                    if depth == 1 {
                        continue;
                    }
                    out.push(*ch);
                }
                _ if *ch == close => {
                    depth = depth.saturating_sub(1);
                    if depth == 0 {
                        return Some((out, idx + 1));
                    }
                    out.push(*ch);
                }
                _ => out.push(*ch),
            }
        }
        None
    }

    /// 检测是否匹配 raw 函数名并紧跟 '('，返回函数名长度。
    fn starts_with_raw_func(&self, input: &[char], idx: usize, names: &[&str]) -> Option<usize> {
        for name in names {
            let pat: Vec<char> = name.chars().chain(['(']).collect();
            if idx + pat.len() > input.len() {
                continue;
            }
            if input[idx..idx + pat.len()]
                .iter()
                .zip(pat.iter())
                .all(|(a, b)| a == b)
            {
                return Some(name.len());
            }
        }
        None
    }

    /// 读取 raw 函数块（如 symbol/自定义函数），内部内容原样保留（含管道/逗号/转义）。
    fn read_raw_func_block(&self, input: &[char], name_len: usize) -> Option<(String, usize)> {
        let mut out = String::new();
        let mut depth = 0i32;
        let mut in_str = false;
        let mut escaped = false;
        let mut seen_func = false;

        for (idx, ch) in input.iter().enumerate() {
            out.push(*ch);
            // 首个 '(' 之前确保匹配函数名，避免误读相似前缀
            if !seen_func && idx + 1 == name_len {
                seen_func = true;
            }
            if escaped {
                escaped = false;
                continue;
            }
            if *ch == '\\' {
                escaped = true;
                continue;
            }
            if *ch == '"' {
                in_str = !in_str;
                continue;
            }
            if in_str {
                continue;
            }
            if *ch == '(' {
                depth += 1;
            } else if *ch == ')' {
                depth -= 1;
                if depth == 0 {
                    return Some((out, idx + 1));
                }
            }
        }
        None
    }
}

#[derive(Debug)]
pub enum WplFormatError {
    UnclosedLiteral,
}
