use wp_data_fmt::{DataFormat, FormatType, Json};
use wp_editor::{record_to_fields, warp_check_record};

#[test]
fn test_warp_check_nginx_log() {
    simple_log::quick!();

    let log_data = r#"222.133.52.20 - - [06/Aug/2019:12:12:19 +0800] "GET /nginx-logo.png HTTP/1.1" 200 368 "http://119.122.1.4/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36" "-""#;

    let wpl_rule = r#"package /example/simple {
rule nginx {
    (ip:sip,_^2,time:recv_time<[,]>,http/request",http/status,digit,chars",http/agent",_")
}
}"#;

    let record = warp_check_record(wpl_rule, log_data).expect("解析应该成功");
    let fields = record_to_fields(&record);

    assert!(fields.len() >= 7, "应该至少有7个字段");

    // 辅助函数：验证字段值
    let assert_field = |name: &str, expected: &str| {
        let field = fields
            .iter()
            .find(|f| f.name == name)
            .unwrap_or_else(|| panic!("应该有 {} 字段", name));
        assert_eq!(field.value, expected, "{} 值应该正确", name);
    };

    assert_field("sip", "222.133.52.20");
    assert_field("recv_time", "2019-08-06 12:12:19");
    assert_field("http/request", "GET /nginx-logo.png HTTP/1.1");
    assert_field("http/status", "200");
}

#[test]
fn test_warp_check_empty_rule() {
    let log_data = "test data";
    let empty_rule = r#"package /example/empty {}"#;

    let result = warp_check_record(empty_rule, log_data);

    assert!(result.is_err(), "空规则应该返回错误");
}

#[test]
fn test_to_json() {
    let log_data = r#"222.133.52.20 - - [06/Aug/2019:12:12:19 +0800] "GET /nginx-logo.png HTTP/1.1" 200 368 "http://119.122.1.4/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36" "-""#;

    let wpl_rule = r#"package /example/simple {
rule nginx {
    (ip:sip,_^2,time:recv_time<[,]>,http/request",http/status,digit,chars",http/agent",_")
}
}"#;

    let record = warp_check_record(wpl_rule, log_data).expect("解析应该成功");

    // 使用 to_json! 宏测试 JSON 序列化
    let fields = record_to_fields(&record);
    assert!(!fields.is_empty(), "格式化的 JSON 不应为空");
    assert!(fields.len() >= 7, "JSON 数组应该至少有7个元素");

    // 测试 wp_data_fmt 的 JSON 格式化
    let formatter = FormatType::Json(Json);
    let json_string = formatter.format_record(&record);

    assert!(!json_string.is_empty(), "格式化的 JSON 不应为空");
    assert!(json_string.contains("sip"), "格式化的 JSON 应包含 sip 字段");
    assert!(
        json_string.contains("222.133.52.20"),
        "格式化的 JSON 应包含 IP 值"
    );
}
