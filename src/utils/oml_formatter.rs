/// OML 代码格式化器，仅负责纯文本格式化，不涉及文件读写
pub struct OmlFormatter {
    indent: &'static str,
}

impl Default for OmlFormatter {
    fn default() -> Self {
        Self::new()
    }
}

impl OmlFormatter {
    /// 创建格式化器，不绑定路径，便于独立处理任意 OML 字符串
    pub fn new() -> Self {
        Self { indent: "    " }
    }

    /// 对传入的 OML 文本进行格式化，统一缩进、空行与换行符
    pub fn format_content(&self, content: &str) -> String {
        let normalized = content
            .replace("\r\n", "\n")
            .replace('\r', "\n")
            .replace('\t', self.indent);

        let mut formatted = String::new();
        let mut indent_level: isize = 0;
        let mut last_empty = false;

        let mut lines = normalized.lines().peekable();

        while let Some(line) = lines.next() {
            let trimmed = line.trim();

            // 将属性块（如 #[tag(...), copy_raw(...)]）合并为单行，避免多行格式化
            if trimmed.starts_with("#[") && !trimmed.contains(']') {
                let mut attr_line = trimmed.to_string();
                for next_line in lines.by_ref() {
                    let next_trimmed = next_line.trim();
                    if next_trimmed.is_empty() {
                        continue;
                    }
                    attr_line.push(' ');
                    attr_line.push_str(next_trimmed);
                    if next_trimmed.contains(']') {
                        break;
                    }
                }
                let normalized_attr = normalize_attribute_line(&attr_line);
                let attr_line = normalized_attr.as_str();

                let segments = split_oml_segments(attr_line);
                for segment in segments {
                    let closing_prefix = segment
                        .chars()
                        .take_while(|c| matches!(c, '}' | ')' | ']'))
                        .count() as isize;
                    let current_indent = (indent_level - closing_prefix).max(0);

                    for _ in 0..current_indent {
                        formatted.push_str(self.indent);
                    }
                    formatted.push_str(&segment);
                    formatted.push('\n');

                    let (open, close) = count_delimiters(&segment);
                    indent_level = (indent_level + open as isize - close as isize).max(0);
                    last_empty = false;
                }

                continue;
            }

            if trimmed.is_empty() {
                if !last_empty {
                    formatted.push('\n');
                    last_empty = true;
                }
                continue;
            }

            let normalized_line = normalize_inline_spacing(trimmed);
            let adjusted_line = normalize_arrow_spacing(&normalized_line);
            let segments = split_oml_segments(&adjusted_line);

            for segment in segments {
                let closing_prefix = segment
                    .chars()
                    .take_while(|c| matches!(c, '}' | ')' | ']'))
                    .count() as isize;
                let current_indent = (indent_level - closing_prefix).max(0);

                for _ in 0..current_indent {
                    formatted.push_str(self.indent);
                }
                formatted.push_str(&segment);
                formatted.push('\n');

                let (open, close) = count_delimiters(&segment);
                indent_level = (indent_level + open as isize - close as isize).max(0);
                last_empty = false;
            }
        }

        if !formatted.ends_with('\n') {
            formatted.push('\n');
        }

        collapse_blank_lines(&formatted)
    }
}

/// 统计一行内的括号数量（忽略转义与字符串字面量中的符号）
fn count_delimiters(line: &str) -> (usize, usize) {
    let mut open = 0;
    let mut close = 0;
    let mut escaped = false;
    let mut in_string = false;

    for ch in line.chars() {
        if escaped {
            escaped = false;
            continue;
        }

        match ch {
            '\\' => {
                escaped = true;
            }
            '"' => {
                in_string = !in_string;
            }
            '{' | '(' | '[' if !in_string => {
                open += 1;
            }
            '}' | ')' | ']' if !in_string => {
                close += 1;
            }
            _ => {}
        }
    }

    (open, close)
}

/// 优化行内 `{` 两侧的空格，避免标识符与块体粘连
fn normalize_inline_spacing(line: &str) -> String {
    let mut result = String::with_capacity(line.len() + 4);
    let mut prev: Option<char> = None;
    let mut escaped = false;
    let mut in_string = false;

    for ch in line.chars() {
        if escaped {
            result.push(ch);
            escaped = false;
            prev = Some(ch);
            continue;
        }

        match ch {
            '\\' => {
                escaped = true;
                result.push(ch);
            }
            '"' => {
                in_string = !in_string;
                result.push(ch);
            }
            '{' if !in_string => {
                if let Some(p) = prev
                    && !p.is_whitespace()
                {
                    result.push(' ');
                }
                result.push(ch);
            }
            _ => result.push(ch),
        }

        prev = Some(ch);
    }

    result
}

/// 保证 OML 中的 `=>` 两侧留空，增强可读性
fn normalize_arrow_spacing(line: &str) -> String {
    let mut result = String::with_capacity(line.len() + 4);
    let chars: Vec<char> = line.chars().collect();
    let mut idx = 0;
    let mut escaped = false;
    let mut in_string = false;

    while idx < chars.len() {
        let ch = chars[idx];
        if escaped {
            result.push(ch);
            escaped = false;
            idx += 1;
            continue;
        }

        match ch {
            '\\' => {
                result.push(ch);
                escaped = true;
            }
            '"' => {
                result.push(ch);
                in_string = !in_string;
            }
            '=' if !in_string && idx + 1 < chars.len() && chars[idx + 1] == '>' => {
                if let Some(last) = result.chars().last()
                    && !last.is_whitespace()
                {
                    result.push(' ');
                }
                result.push('=');
                result.push('>');
                let next_char = chars.get(idx + 2).copied();
                if let Some(nc) = next_char
                    && !nc.is_whitespace()
                {
                    result.push(' ');
                }
                idx += 2;
                continue;
            }
            _ => result.push(ch),
        }

        idx += 1;
    }

    result
}

/// 折叠属性块的空白与逗号间距，确保属性保持单行展示
fn normalize_attribute_line(line: &str) -> String {
    let collapsed = collapse_whitespace_outside_string(line);
    let mut result = String::with_capacity(collapsed.len());
    let mut chars = collapsed.chars().peekable();
    let mut escaped = false;
    let mut in_string = false;

    while let Some(ch) = chars.next() {
        if escaped {
            result.push(ch);
            escaped = false;
            continue;
        }

        match ch {
            '\\' => {
                escaped = true;
                result.push(ch);
            }
            '"' => {
                in_string = !in_string;
                result.push(ch);
            }
            ' ' if !in_string => {
                // 跳过标点前后的多余空格
                let prev = result.chars().last();
                let next = chars.peek().copied();
                if matches!(prev, Some('[' | '(' | ',')) {
                    continue;
                }
                if matches!(next, Some(']' | ')' | ',')) {
                    continue;
                }
                result.push(' ');
            }
            ',' if !in_string => {
                result.push(',');
                let next = chars.peek().copied();
                if !matches!(next, Some(' ') | None | Some(']')) {
                    result.push(' ');
                }
            }
            _ => result.push(ch),
        }
    }

    result
}

/// 折叠字符串外的连续空白为单个空格，保持字面量内部空格
fn collapse_whitespace_outside_string(input: &str) -> String {
    let mut result = String::with_capacity(input.len());
    let mut escaped = false;
    let mut in_string = false;
    let mut last_was_space = false;

    for ch in input.chars() {
        if escaped {
            result.push(ch);
            escaped = false;
            last_was_space = false;
            continue;
        }

        match ch {
            '\\' => {
                escaped = true;
                result.push(ch);
                last_was_space = false;
            }
            '"' => {
                in_string = !in_string;
                result.push(ch);
                last_was_space = false;
            }
            c if c.is_whitespace() && !in_string => {
                if !last_was_space {
                    result.push(' ');
                    last_was_space = true;
                }
            }
            _ => {
                result.push(ch);
                last_was_space = false;
            }
        }
    }

    result
}

/// 将连续的空行折叠为单个空行，避免输出出现多余的空白
fn collapse_blank_lines(text: &str) -> String {
    let mut result = String::with_capacity(text.len());
    let mut last_blank = false;

    for line in text.split('\n') {
        let is_blank = line.trim().is_empty();
        if is_blank && last_blank {
            continue;
        }
        last_blank = is_blank;
        result.push_str(line);
        result.push('\n');
    }

    result
}

/// 将 OML 行按语句分号拆分，同时保留括号与字符串内的字符
fn split_oml_segments(line: &str) -> Vec<String> {
    let mut segments = Vec::new();
    let mut buf = String::new();
    let mut escaped = false;
    let mut in_string = false;

    let push_buf = |buffer: &mut String, list: &mut Vec<String>| {
        let trimmed = buffer.trim();
        if !trimmed.is_empty() {
            list.push(trimmed.to_string());
        }
        buffer.clear();
    };

    for ch in line.chars() {
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
                in_string = !in_string;
            }
            ';' if !in_string => {
                buf.push(ch);
                push_buf(&mut buf, &mut segments);
            }
            _ => buf.push(ch),
        }
    }

    push_buf(&mut buf, &mut segments);

    segments
}
