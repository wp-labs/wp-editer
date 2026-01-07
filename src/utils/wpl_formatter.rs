/// WPL 代码格式化器：仅通过调整空格与换行实现可读性，不改动任何标记内容。
pub struct WplFormatter {
    indent: &'static str,
}

impl Default for WplFormatter {
    fn default() -> Self {
        Self::new()
    }
}

impl WplFormatter {
    pub fn new() -> Self {
        Self { indent: "    " }
    }

    /// 仅进行空格/换行的规整：规范换行符，并将行内或跨行的 json/csv/kv 调用按逗号拆行。
    pub fn format_content(&self, content: &str) -> String {
        let normalized = normalize_newlines(content);
        let collapsed = collapse_tag_blocks(&normalized);
        let calls = reflow_calls(&collapsed, self.indent);
        reflow_tuples(&calls, self.indent)
    }
}

fn normalize_newlines(input: &str) -> String {
    input.replace("\r\n", "\n").replace('\r', "\n")
}

/// 将多行的属性块（#[... ]）折叠为单行展示，仅调整空白。
fn collapse_tag_blocks(content: &str) -> String {
    let mut out = String::with_capacity(content.len());
    let mut lines = content.lines().peekable();

    while let Some(line) = lines.next() {
        let trimmed = line.trim_start();
        if !trimmed.starts_with("#[") {
            out.push_str(line);
            out.push('\n');
            continue;
        }

        let leading_ws: String = line.chars().take_while(|c| c.is_whitespace()).collect();
        let mut collected = String::new();

        // 去掉首行的 "#[" 前缀
        let mut remainder = trimmed.trim_start_matches("#[").trim();
        let mut found = remainder.contains(']');

        if let Some(pos) = remainder.find(']') {
            collected.push_str(remainder[..pos].trim());
            remainder = remainder[(pos + 1)..].trim();
            found = true;
        } else {
            collected.push_str(remainder);
        }

        while !found {
            match lines.next() {
                Some(next_line) => {
                    let part = next_line.trim();
                    if let Some(pos) = part.find(']') {
                        collected.push(' ');
                        collected.push_str(part[..pos].trim());
                        remainder = part[(pos + 1)..].trim();
                        found = true;
                    } else {
                        collected.push(' ');
                        collected.push_str(part);
                    }
                }
                None => break,
            }
        }

        let collapsed_inner = collected.split_whitespace().collect::<Vec<_>>().join(" ");
        out.push_str(&leading_ws);
        out.push_str("#[");
        out.push_str(&collapsed_inner);
        out.push(']');
        if !remainder.is_empty() {
            out.push(' ');
            out.push_str(remainder);
        }
        out.push('\n');
    }

    out
}

/// 在全文中查找 json/csv/kv 调用并拆行（支持跨行），保持标记顺序不变。
fn reflow_calls(content: &str, indent: &str) -> String {
    let targets = ["json(", "csv(", "kv("];
    let bytes = content.as_bytes();
    let mut out = String::with_capacity(content.len() + 128);
    let mut idx = 0usize;
    let len = bytes.len();

    while idx < len {
        let slice = &content[idx..];
        let (target, offset) = match targets
            .iter()
            .filter_map(|t| slice.find(t).map(|pos| (*t, pos)))
            .min_by_key(|(_, pos)| *pos)
        {
            Some(v) => v,
            None => {
                out.push_str(slice);
                break;
            }
        };

        let start = idx + offset;
        let open_idx = start + target.len() - 1;
        let close_idx = match find_matching_paren(bytes, open_idx) {
            Some(c) => c,
            None => {
                out.push_str(&content[idx..]);
                break;
            }
        };

        let line_start = content[..start].rfind('\n').map(|p| p + 1).unwrap_or(0);
        let line_end = content[close_idx..]
            .find('\n')
            .map(|p| close_idx + p)
            .unwrap_or(len);

        let prefix = &content[line_start..start];
        let leading_ws: String = prefix.chars().take_while(|c| c.is_whitespace()).collect();
        let prefix_has_token = !prefix.trim().is_empty();

        let body = &content[(open_idx + 1)..close_idx];
        let suffix = &content[(close_idx + 1)..line_end];

        let (args, trailing_comma) = split_args_preserve_trailing(body);
        if args.is_empty() {
            out.push_str(&content[idx..line_end]);
            idx = line_end.saturating_add(1);
            continue;
        }

        out.push_str(&content[idx..line_start]);

        if prefix_has_token {
            out.push_str(prefix);
            out.push('\n');
        }

        let func_indent = if prefix_has_token {
            format!("{}{}", leading_ws, indent)
        } else {
            leading_ws.clone()
        };
        let arg_indent = format!("{}{}", func_indent, indent);

        out.push_str(&func_indent);
        out.push_str(target.trim_end_matches('('));
        out.push('(');
        out.push('\n');

        let last_idx = args.len().saturating_sub(1);
        for (idx_arg, arg) in args.iter().enumerate() {
            out.push_str(&arg_indent);
            out.push_str(arg.trim());
            if idx_arg != last_idx || trailing_comma {
                out.push(',');
            }
            out.push('\n');
        }

        out.push_str(&func_indent);
        out.push(')');

        let suffix_trim = suffix.trim();
        if !suffix_trim.is_empty() {
            out.push('\n');
            out.push_str(&leading_ws);
            out.push_str(suffix_trim);
        }
        out.push('\n');

        if line_end < len {
            idx = line_end + 1;
        } else {
            break;
        }
    }

    out
}

fn find_matching_paren(bytes: &[u8], open_idx: usize) -> Option<usize> {
    let mut depth = 0i32;
    let mut in_string = false;
    let mut i = open_idx;
    while i < bytes.len() {
        let b = bytes[i];
        if b == b'"' {
            in_string = !in_string;
            i += 1;
            continue;
        }
        if in_string {
            i += 1;
            continue;
        }
        if b == b'(' {
            depth += 1;
        } else if b == b')' {
            depth -= 1;
            if depth == 0 {
                return Some(i);
            }
        }
        i += 1;
    }
    None
}

fn split_args_preserve_trailing(body: &str) -> (Vec<String>, bool) {
    let mut res = Vec::new();
    let mut buf = String::new();
    let mut depth = 0i32;
    let mut in_string = false;

    for ch in body.chars() {
        if ch == '"' {
            in_string = !in_string;
            buf.push(ch);
            continue;
        }
        if in_string {
            buf.push(ch);
            continue;
        }
        match ch {
            '(' | '{' | '[' | '<' => {
                depth += 1;
                buf.push(ch);
            }
            ')' | '}' | ']' | '>' => {
                depth = (depth - 1).max(0);
                buf.push(ch);
            }
            ',' if depth == 0 => {
                res.push(buf.trim().to_string());
                buf.clear();
            }
            _ => buf.push(ch),
        }
    }

    let trailing_comma = body.trim_end().ends_with(',');
    let tail = buf.trim();
    if !tail.is_empty() {
        res.push(tail.to_string());
    }

    let has_items = !res.is_empty();
    (res, trailing_comma && has_items)
}

/// 拆分元组块 (a,b,...)，无论是否跨行，保证每个字段单独一行，逗号紧随字段。
fn reflow_tuples(content: &str, indent: &str) -> String {
    let mut out = String::with_capacity(content.len() + 64);
    let mut lines = content.lines().peekable();

    while let Some(line) = lines.next() {
        let trimmed = line.trim_start();
        if !trimmed.starts_with('(')
            || trimmed.starts_with("(json(")
            || trimmed.starts_with("(csv(")
            || trimmed.starts_with("(kv(")
        {
            out.push_str(line);
            out.push('\n');
            continue;
        }

        // 收集完整的元组块，直到括号平衡
        let mut block = String::from(line);
        while !paren_balanced(&block) {
            if let Some(next) = lines.next() {
                block.push('\n');
                block.push_str(next);
            } else {
                break;
            }
        }

        if let Some(formatted) = format_tuple_block(&block, indent) {
            out.push_str(&formatted);
        } else {
            out.push_str(&block);
            out.push('\n');
        }
    }

    out
}

fn paren_balanced(text: &str) -> bool {
    let mut depth = 0i32;
    let mut in_string = false;
    for b in text.as_bytes() {
        if *b == b'"' {
            in_string = !in_string;
            continue;
        }
        if in_string {
            continue;
        }
        match *b {
            b'(' => depth += 1,
            b')' => depth -= 1,
            _ => {}
        }
    }
    depth == 0
}

fn format_tuple_block(block: &str, indent: &str) -> Option<String> {
    let open_idx = block.find('(')?;
    let close_idx = find_matching_paren(block.as_bytes(), open_idx)?;

    let body = &block[(open_idx + 1)..close_idx];
    let suffix = &block[(close_idx + 1)..];

    let (args, trailing_comma) = split_args_preserve_trailing(body);
    if args.is_empty() {
        return None;
    }

    let leading_ws: String = block
        .lines()
        .next()
        .unwrap_or_default()
        .chars()
        .take_while(|c| c.is_whitespace())
        .collect();

    let mut out = String::new();
    out.push_str(&leading_ws);
    out.push('(');
    out.push('\n');

    let item_indent = format!("{}{}", leading_ws, indent);
    let last_idx = args.len().saturating_sub(1);
    for (idx, arg) in args.iter().enumerate() {
        out.push_str(&item_indent);
        out.push_str(arg.trim());
        if idx != last_idx || trailing_comma {
            out.push(',');
        }
        out.push('\n');
    }

    out.push_str(&leading_ws);
    out.push(')');
    let suffix_trim = suffix.trim();
    if !suffix_trim.is_empty() {
        out.push_str(suffix_trim);
    }
    out.push('\n');

    Some(out)
}
