/// OML 代码格式化器：保持语义不变，统一缩进/空行/行内空格与属性折叠。
pub struct OmlFormatter {
    indent: usize,
}

impl Default for OmlFormatter {
    fn default() -> Self {
        Self::new()
    }
}

impl OmlFormatter {
    /// 默认 4 空格缩进。
    pub fn new() -> Self {
        Self { indent: 4 }
    }

    pub fn format_content(&self, content: &str) -> String {
        self.format(content).unwrap_or_else(|_| content.to_string())
    }

    fn format(&self, content: &str) -> Result<String, ()> {
        let normalized = content.replace("\r\n", "\n").replace('\r', "\n");
        let normalized = normalized.replace('\t', &" ".repeat(self.indent));

        // 分离头部与主体
        let mut header = Vec::new();
        let mut body_lines: Vec<String> = Vec::new();
        let mut had_sep = false;
        let mut lines = normalized.lines().peekable();
        while let Some(line) = lines.next() {
            let trimmed = line.trim();
            if trimmed == "---" {
                had_sep = true;
                break;
            }
            if trimmed.starts_with("#[") {
                header.push(collect_attr_block_lines(trimmed, &mut lines));
                continue;
            }
            if !trimmed.is_empty() {
                header.push(trimmed.to_string());
            }
        }
        if had_sep {
            for line in lines {
                body_lines.push(line.to_string());
            }
        } else {
            body_lines = normalized.lines().map(|l| l.to_string()).collect();
            header.clear();
        }

        let mut out = String::new();
        for line in &header {
            if line.trim_start().starts_with("#[") {
                out.push_str(&format_attribute(line));
                out.push('\n');
                continue;
            }
            if let Some((k, v)) = line.split_once(':') {
                out.push_str(&format!("{} : {}\n", k.trim_end(), v.trim_start()));
            } else {
                out.push_str(line.trim());
                out.push('\n');
            }
        }
        let mut body_formatted = self.format_body(&body_lines.join("\n"));

        if had_sep || !header.is_empty() {
            out.push_str("---\n");
            if !body_formatted.trim().is_empty() {
                out.push('\n');
            }
            while body_formatted.starts_with('\n') {
                body_formatted.remove(0);
            }
        }

        out.push_str(&body_formatted);

        if !out.ends_with('\n') {
            out.push('\n');
        }
        Ok(out)
    }

    fn format_body(&self, body: &str) -> String {
        let mut out = String::new();
        let mut chars = body.chars().peekable();
        let mut indent = 0usize;
        let indent_unit = " ".repeat(self.indent);
        let mut start_of_line = true;
        let mut pending_newlines = 0usize;
        let mut after_eq = false;

        while let Some(ch) = chars.next() {
            if ch.is_whitespace() {
                if ch == '\n' {
                    pending_newlines += 1;
                } else if !start_of_line && !out.ends_with(' ') && !out.ends_with('\n') {
                    out.push(' ');
                }
                continue;
            }

            if pending_newlines > 0 {
                if ch == ';' {
                    // 分号前不允许空格/换行，直接贴合上一 token
                    start_of_line = false;
                } else if ch == '=' || after_eq {
                    if !start_of_line && !out.ends_with(' ') && !out.ends_with('\n') {
                        out.push(' ');
                    }
                    start_of_line = false;
                } else {
                    let count = if pending_newlines > 1 { 2 } else { 1 };
                    if count == 1 {
                        if !out.ends_with('\n') {
                            out.push('\n');
                        }
                    } else {
                        out.push('\n');
                        out.push('\n');
                    }
                    start_of_line = true;
                }
                pending_newlines = 0;
            }

            // 属性块
            if ch == '#' && matches!(chars.peek(), Some('[')) {
                after_eq = false;
                if !start_of_line && !out.ends_with('\n') {
                    out.push('\n');
                }
                if indent > 0 {
                    out.push_str(&indent_unit.repeat(indent));
                }
                out.push_str(&format_attribute(&collect_attr_block("#[", &mut chars)));
                out.push('\n');
                start_of_line = true;
                continue;
            }

            // 字符串字面量
            if ch == '"' {
                after_eq = false;
                self.write_indent_if_needed(start_of_line, indent, &indent_unit, &mut out);
                out.push('"');
                let mut escaped = false;
                for c in chars.by_ref() {
                    out.push(c);
                    if escaped {
                        escaped = false;
                    } else if c == '\\' {
                        escaped = true;
                    } else if c == '"' {
                        break;
                    }
                }
                start_of_line = false;
                continue;
            }

            // => 运算符
            if ch == '=' && matches!(chars.peek(), Some('>')) {
                after_eq = false;
                self.write_indent_if_needed(start_of_line, indent, &indent_unit, &mut out);
                if !start_of_line && !out.ends_with(' ') && !out.ends_with('\n') {
                    out.push(' ');
                }
                out.push_str("=>");
                chars.next();
                out.push(' ');
                start_of_line = false;
                continue;
            }

            // 普通等号，统一两侧空格，且保持同一行
            if ch == '=' {
                self.write_indent_if_needed(start_of_line, indent, &indent_unit, &mut out);
                if !start_of_line && !out.ends_with(' ') && !out.ends_with('\n') {
                    out.push(' ');
                }
                out.push('=');
                out.push(' ');
                start_of_line = false;
                after_eq = true;
                continue;
            }

            // 左花括号
            if ch == '{' {
                after_eq = false;
                if !start_of_line && !out.ends_with(' ') && !out.ends_with('\n') {
                    out.push(' ');
                }
                // 检查空块
                let mut clone_iter = chars.clone();
                while matches!(clone_iter.peek(), Some(c) if c.is_whitespace()) {
                    clone_iter.next();
                }
                if matches!(clone_iter.next(), Some('}')) {
                    self.write_indent_if_needed(start_of_line, indent, &indent_unit, &mut out);
                    out.push_str("{}");
                    while let Some(c) = chars.peek() {
                        if c.is_whitespace() {
                            chars.next();
                        } else {
                            break;
                        }
                    }
                    chars.next(); // consume '}'
                    start_of_line = false;
                } else {
                    self.write_indent_if_needed(start_of_line, indent, &indent_unit, &mut out);
                    out.push('{');
                    out.push('\n');
                    indent += 1;
                    start_of_line = true;
                }
                continue;
            }

            // 右花括号
            if ch == '}' {
                after_eq = false;
                indent = indent.saturating_sub(1);
                if !start_of_line {
                    out.push('\n');
                }
                self.write_indent_if_needed(true, indent, &indent_unit, &mut out);
                out.push('}');

                // 若后续紧跟分号（可跨空白），则同一行输出 `};`
                let mut lookahead = chars.clone();
                let mut skipped = 0usize;
                while matches!(lookahead.peek(), Some(c) if c.is_whitespace()) {
                    lookahead.next();
                    skipped += 1;
                }
                if matches!(lookahead.peek(), Some(';')) {
                    for _ in 0..skipped {
                        chars.next();
                    }
                    chars.next(); // consume ';'
                    out.push(';');
                    out.push('\n');
                } else {
                    out.push('\n');
                }
                start_of_line = true;
                continue;
            }

            // 语句结束
            if ch == ';' {
                after_eq = false;
                while matches!(out.chars().last(), Some(' ' | '\n')) {
                    out.pop();
                }
                out.push(';');
                out.push('\n');
                start_of_line = true;
                continue;
            }

            self.write_indent_if_needed(start_of_line, indent, &indent_unit, &mut out);
            out.push(ch);
            start_of_line = false;
            after_eq = false;
        }

        let mut res = collapse_blank_lines(&out);
        // 确保尾部有一个空行
        if !res.is_empty() && !res.ends_with("\n\n") {
            if res.ends_with('\n') {
                res.push('\n');
            } else {
                res.push_str("\n\n");
            }
        }
        res
    }

    fn write_indent_if_needed(
        &self,
        start_of_line: bool,
        indent: usize,
        indent_unit: &str,
        out: &mut String,
    ) {
        if start_of_line {
            out.push_str(&indent_unit.repeat(indent));
        }
    }
}

/// 收集属性块文本（跨行），直到匹配到对应的 ']'
fn collect_attr_block_lines<'a, I>(start_line: &str, lines: &mut std::iter::Peekable<I>) -> String
where
    I: Iterator<Item = &'a str>,
{
    let mut buf = String::new();
    buf.push_str(start_line);
    buf.push('\n');
    let mut depth = start_line.matches('[').count() as i32 - start_line.matches(']').count() as i32;
    let mut in_str = false;
    let mut escaped = false;

    for line in lines {
        for ch in line.chars() {
            buf.push(ch);
            if escaped {
                escaped = false;
                continue;
            }
            if ch == '\\' {
                escaped = true;
                continue;
            }
            if ch == '"' {
                in_str = !in_str;
            }
            if !in_str {
                if ch == '[' {
                    depth += 1;
                } else if ch == ']' {
                    depth -= 1;
                }
            }
        }
        buf.push('\n');
        if depth <= 0 {
            break;
        }
    }

    buf.trim_end().to_string()
}

/// 收集属性块文本（字符级）
fn collect_attr_block<T>(start: &str, iter: &mut T) -> String
where
    T: Iterator<Item = char>,
{
    let mut buf = String::from(start);
    let mut depth = start.chars().filter(|c| *c == '[').count() as i32;
    let mut in_str = false;
    let mut escaped = false;
    for c in iter.by_ref() {
        buf.push(c);
        if escaped {
            escaped = false;
            continue;
        }
        if c == '\\' {
            escaped = true;
            continue;
        }
        if c == '"' {
            in_str = !in_str;
        }
        if !in_str {
            if c == '[' {
                depth += 1;
            } else if c == ']' {
                depth -= 1;
                if depth == 0 {
                    break;
                }
            }
        }
    }
    buf
}

/// 将属性块压缩为单行，保持键值顺序
fn format_attribute(raw: &str) -> String {
    let inner = raw.trim().trim_start_matches("#[").trim_end_matches(']');
    let items = split_top_level(inner, ',');
    let mut parts = Vec::new();

    for item in items {
        let trimmed = collapse_ws(item.trim());
        if let Some((name, args_raw)) = trimmed.split_once('(') {
            let args_inner = args_raw.trim_end_matches(')');
            let args = split_top_level(args_inner, ',');
            let mut arg_parts = Vec::new();
            for arg in args {
                let arg_clean = collapse_ws(arg.trim());
                if let Some((k, v)) = arg_clean.split_once(':') {
                    let k = k.trim();
                    let v = v.trim();
                    if name.trim() == "tag" {
                        arg_parts.push(format!("{}: {}", k, v));
                    } else {
                        arg_parts.push(format!("{}:{}", k, v));
                    }
                } else {
                    arg_parts.push(arg_clean);
                }
            }
            parts.push(format!("{}({})", name.trim(), arg_parts.join(",")));
        } else if !trimmed.is_empty() {
            parts.push(trimmed.to_string());
        }
    }

    format!("#[{}]", parts.join(",")).replace('\n', "")
}

/// 按顶层分隔符拆分，忽略字符串与嵌套括号
fn split_top_level(input: &str, delim: char) -> Vec<String> {
    let mut res = Vec::new();
    let mut buf = String::new();
    let mut depth = 0i32;
    let mut in_str = false;
    let mut escaped = false;

    for ch in input.chars() {
        if escaped {
            buf.push(ch);
            escaped = false;
            continue;
        }
        match ch {
            '\\' => {
                buf.push(ch);
                escaped = true;
            }
            '"' => {
                buf.push(ch);
                in_str = !in_str;
            }
            '(' | '[' | '{' if !in_str => {
                depth += 1;
                buf.push(ch);
            }
            ')' | ']' | '}' if !in_str => {
                depth -= 1;
                buf.push(ch);
            }
            _ if ch == delim && depth == 0 && !in_str => {
                res.push(buf.trim().to_string());
                buf.clear();
            }
            _ => buf.push(ch),
        }
    }
    if !buf.trim().is_empty() {
        res.push(buf.trim().to_string());
    }
    res
}

fn collapse_ws(s: &str) -> String {
    let mut out = String::new();
    let mut prev_space = false;
    for ch in s.chars() {
        if ch.is_whitespace() {
            if !prev_space {
                out.push(' ');
                prev_space = true;
            }
        } else {
            prev_space = false;
            out.push(ch);
        }
    }
    out.trim().to_string()
}

/// 折叠连续空行为单个空行
fn collapse_blank_lines(text: &str) -> String {
    let mut result = String::new();
    let mut last_blank = false;

    for line in text.lines() {
        let blank = line.trim().is_empty();
        if blank && last_blank {
            continue;
        }
        last_blank = blank;
        result.push_str(line.trim_end());
        result.push('\n');
    }

    result
}
