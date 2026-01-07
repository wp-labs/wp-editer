use wp_editor::WplFormatter;

// 基础格式化：注解、规则、字段与管道应保持结构且具备幂等性。
#[test]
fn format_should_be_idempotent() {
    let formatter = WplFormatter::new();
    let raw = r#"
#[tag(dev_vendor:"示例",dev_name:"demo"),copy_raw(name:"raw_msg")]
package demo{
rule r{
| decode/base64 | unquote/unescape |
(3*ip@sip:src, chars(host)\@host:dst[16]<[,]>\, | f_has(src), json(@k:v))
}
}
"#;

    let once = formatter.format_content(raw);
    let twice = formatter.format_content(&once);
    assert_eq!(once, twice, "多次格式化应保持输出不变");
    assert!(
        once.contains("| decode/base64 |"),
        "预处理链应被保留：{}",
        once
    );
    assert!(once.contains("f_has("), "字段管道函数应被保留：{}", once);
}

// 复杂分组与子字段：校验分组、子字段缩进与尾随逗号。
#[test]
fn format_should_layout_groups_and_subfields() {
    let formatter = WplFormatter::new();
    let raw = r#"
package log_pkg {
    rule complex {
        alt(
            kv(
                chars@id:id,
                opt(domain)@host:host_name^2,
                json(
                    digit@count,
                    chars@label:label_val
                )| ip_in([127.0.0.1])
            ),
            seq(ip, symbol(ok|!), _@*)
        )
    }
}
"#;

    let formatted = formatter.format_content(raw);
    assert!(
        formatted.contains("opt(domain)@host:host_name"),
        "可选子字段与路径应保留：{}",
        formatted
    );
    assert!(
        formatted.contains("ip_in([127.0.0.1])"),
        "函数参数应被正确渲染：{}",
        formatted
    );
    assert!(
        formatted.contains("kv(") && formatted.contains("json("),
        "嵌套分组应存在：{}",
        formatted
    );
}

// 逃逸括号与管道应视为普通字符，不应被重新缩进或拆分。
#[test]
fn format_should_keep_escaped_parens() {
    let formatter = WplFormatter::new();
    let raw = r#"
package huawei {
    rule common_module_log {
        (
            chars\#,
            time:TimeStamp,
            _,
            chars:Hostname,
            chars\%\%,
            digit:dd,
            chars:ModuleName\/,
            chars:SeverityHeader\/,
        ),
        alt(
            symbol(LOGONFAIL),
            symbol(RESOURCE),
        )\(,
        (
            chars:type\),
            chars:Cnunt<[,]>,
            chars\:,
            chars:Description\&\*,
        )
    }
}
"#;

    let formatted = formatter.format_content(raw);
    assert!(
        formatted.contains(r")\("),
        "转义括号不应触发分组重排：{}",
        formatted
    );
    assert!(
        formatted.contains(r"chars:type\)"),
        "字段中的转义括号应原样保留：{}",
        formatted
    );
}
