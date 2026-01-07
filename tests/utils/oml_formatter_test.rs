use wp_editor::OmlFormatter;

#[test]
fn format_content_should_keep_blocks_neat() {
    let formatter = OmlFormatter::new();
    let raw = "name : demo \r\nrule : demo/rule\r\n---\r\nblock = match read(kind){\r\nchars(A)=>{\r\nvalue = 1;\r\n}\r\n\r\nchars(B)=>{\r\n    value=2;\r\n}\r\n}\r\n";

    let formatted = formatter.format_content(raw);
    let expected = "\
name : demo
rule : demo/rule
---

block = match read(kind) {
    chars(A) => {
        value = 1;
    }

    chars(B) => {
        value = 2;
    }
}

";

    assert_eq!(formatted, expected, "格式化后应统一缩进与换行");
    assert!(
        !formatted.contains('\t'),
        "格式化后不应包含制表符，便于编辑器展示"
    );
}

#[test]
fn format_content_should_split_by_semicolon_outside_string() {
    let formatter = OmlFormatter::new();
    let raw = r#"pos_sn = read(option:[serial_num]); access_ip: ip = read(access_ip);"#;

    let formatted = formatter.format_content(raw);
    let expected = "\
pos_sn = read(option:[serial_num]);
access_ip: ip = read(access_ip);

";

    assert_eq!(
        formatted, expected,
        "语句分号应拆分成多行，但字符串内的分号需保留"
    );
}

#[test]
fn format_content_should_remove_space_before_semicolon() {
    let formatter = OmlFormatter::new();
    let raw = "value = 1 \n ; another = 2\t ;";

    let formatted = formatter.format_content(raw);
    let expected = "\
value = 1;
another = 2;

";

    assert_eq!(
        formatted, expected,
        "分号前不应存在空格或换行，语句需收敛到同一行"
    );
}

#[test]
fn format_content_should_follow_supplement_examples() {
    let formatter = OmlFormatter::new();
    let raw = "\
name : flow_ssl
rule : skyeye/flow_ssl_kafka
---
vlan_id: digit = match read(vlan_id) {
    in ( digit(0), digit(4095) ) => read(vlan_id) ;
    _ => digit(0) ;
}
;
vxlan_id: digit = match read(option:[vxlan_id]) {
    in ( digit(0), digit(16777215) ) => read(vxlan_id) ;
    _ => digit(0) ;
}
;
gre_key: digit = match read(option:[gre_key]) {
    in ( digit(0), digit(4294967295) ) => read(gre_key) ;
    _ => digit(0) ;
}
;
extend_fields = object {
    backrule_id, priv_info = read();
}
;
data_src_system = digit(13);

";

    let formatted = formatter.format_content(raw);
    let expected = "\
name : flow_ssl
rule : skyeye/flow_ssl_kafka
---

vlan_id: digit = match read(vlan_id) {
    in ( digit(0), digit(4095) ) => read(vlan_id);
    _ => digit(0);
};
vxlan_id: digit = match read(option:[vxlan_id]) {
    in ( digit(0), digit(16777215) ) => read(vxlan_id);
    _ => digit(0);
};
gre_key: digit = match read(option:[gre_key]) {
    in ( digit(0), digit(4294967295) ) => read(gre_key);
    _ => digit(0);
};
extend_fields = object {
    backrule_id, priv_info = read();
};
data_src_system = digit(13);

";

    assert_eq!(
        formatted, expected,
        "应与补充示例二一致：分号前无空格，普通等号两侧有空格且保持同一行"
    );
}

#[test]
fn format_content_should_keep_attribute_on_single_line() {
    let formatter = OmlFormatter::new();
    let raw = r#"#[tag(
        dev_vendor: "青藤云", dev_name: "万相主机自适应安全平台", dev_type: "青藤云HIDS系统"
    )
    , copy_raw(
        name:"raw_msg"
    )
]
rule : qingteng/host
---
block = {}
"#;

    let formatted = formatter.format_content(raw);
    let expected = "\
#[tag(dev_vendor: \"青藤云\",dev_name: \"万相主机自适应安全平台\",dev_type: \"青藤云HIDS系统\"),copy_raw(name:\"raw_msg\")]
rule : qingteng/host
---

block = {}

";

    assert_eq!(formatted, expected, "属性块应折叠为单行，内容保持原有顺序");
}

#[test]
fn format_content_should_collapse_multiple_blank_lines() {
    let formatter = OmlFormatter::new();
    let raw = "\
rule : test
---

block = {}


value = 1;



value = 2;
";

    let formatted = formatter.format_content(raw);
    let expected = "\
rule : test
---

block = {}

value = 1;

value = 2;

";

    assert_eq!(
        formatted, expected,
        "连续空行应被折叠为单个空行，保持结构紧凑"
    );
}
