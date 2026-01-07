use wp_editor::WplFormatter;

#[test]
fn format_content_should_expand_inline_json_and_keep_tokens() {
    let formatter = WplFormatter::new();
    let raw = r#"#[tag(dev_name:"天眼分析平台", dev_type:"syslog", dev_vendor:"天眼分析平台"), copy_raw(name:"raw_msg")]
package skyeye_platform {
    #[tag(alert_src:"52", dev_name:"天眼分析平台", dev_type:"syslog", dev_vendor:"天眼分析平台", log_desc:"告警日志", log_type:"skyeye_platform_mail_alert"), copy_raw(name:"raw_msg")]
    rule skyeye_platform_mail_alert {
        (
            _:pri<<,>>,
            5*_
        ),
        (
            time:update_time,
            ip:access_ip,
            symbol(sandbox_mail|!)
        ),          (json(@attach_type:mail_attachment_mime_type,@mail_to,digit@hazard_level:severity,digit@status:dispose_status_cd,@white_id:is_white_list,@attach_size:mail_attachment_size,@alarm_id:alert_id,@threat_type:origin_alert_cat_cd,@attach_name:mail_attachment_name,@attach_md5:mail_attachment_md5,ip@sip,time_timestamp@access_time:occur_time,@subject:mail_subject,@dimension:attack_dimension,@dev_ip,@mail_from,@serial_num:dev_serial_num,@maltype:malicious_type,@mid:client_fingerprint_id,@mail_cc,@content_html:mail_body,_@*))
    }
}
"#;

    let formatted = formatter.format_content(raw);
    let expected = "\
#[tag(dev_name:\"天眼分析平台\", dev_type:\"syslog\", dev_vendor:\"天眼分析平台\"), copy_raw(name:\"raw_msg\")]
package skyeye_platform {
    #[tag(alert_src:\"52\", dev_name:\"天眼分析平台\", dev_type:\"syslog\", dev_vendor:\"天眼分析平台\", log_desc:\"告警日志\", log_type:\"skyeye_platform_mail_alert\"), copy_raw(name:\"raw_msg\")]
    rule skyeye_platform_mail_alert {
        (
            _:pri<<,>>,
            5*_
        ),
        (
            time:update_time,
            ip:access_ip,
            symbol(sandbox_mail|!)
        ),          (
            json(
                @attach_type:mail_attachment_mime_type,
                @mail_to,
                digit@hazard_level:severity,
                digit@status:dispose_status_cd,
                @white_id:is_white_list,
                @attach_size:mail_attachment_size,
                @alarm_id:alert_id,
                @threat_type:origin_alert_cat_cd,
                @attach_name:mail_attachment_name,
                @attach_md5:mail_attachment_md5,
                ip@sip,
                time_timestamp@access_time:occur_time,
                @subject:mail_subject,
                @dimension:attack_dimension,
                @dev_ip,
                @mail_from,
                @serial_num:dev_serial_num,
                @maltype:malicious_type,
                @mid:client_fingerprint_id,
                @mail_cc,
                @content_html:mail_body,
                _@*
            )
        )
    }
}
";

    assert_eq!(formatted, expected, "json 应被拆行且 _@* 等标记不得丢失");
}

#[test]
fn format_content_should_preserve_trailing_comma() {
    let formatter = WplFormatter::new();
    let raw = "json(@a,@b,)";

    let formatted = formatter.format_content(raw);
    let expected = "\
json(
    @a,
    @b,
)
";

    assert_eq!(formatted, expected, "末尾逗号应原样保留");
}

#[test]
fn format_content_should_respect_existing_indent_when_no_prefix_tokens() {
    let formatter = WplFormatter::new();
    let raw = "    json(@a,@b)";

    let formatted = formatter.format_content(raw);
    let expected = "    json(
        @a,
        @b
    )
";

    assert_eq!(
        formatted, expected,
        "行内只有缩进时，函数名应保持原始缩进级别"
    );
}

#[test]
fn format_content_should_keep_angle_bracket_block_untouched() {
    let formatter = WplFormatter::new();
    let raw = "(_ :pri<<,>>,5*_)";

    let formatted = formatter.format_content(raw);
    let expected = "\
(
    _ :pri<<,>>,
    5*_
)
";

    assert_eq!(
        formatted, expected,
        "尖括号内的逗号不应触发拆分，整体作为单个字段"
    );
}

#[test]
fn format_content_should_expand_multiline_inline_call() {
    let formatter = WplFormatter::new();
    let raw = r#"#[tag(dev_vendor: "天眼分析平台", dev_name: "天眼分析平台", dev_type: "syslog"), copy_raw(name:"raw_msg")]
package skyeye_platform {
     #[
     	tag(log_desc: "告警日志", log_type: "skyeye_platform_jowto_alert", alert_src: "52")
     	]
     rule skyeye_platform_jowto_alert {
        (_:pri<<,>>,5*_),
        (time:update_time\|\!,ip:access_ip\|\!,symbol(yunsuo|!)),
        (json(@dev_ip,@alarm_sip:victim_ip,@attck:attack_method,@alarm_id:alert_id,@access_time:occur_time,digit@group_id:asset_group_id,digit@phase:killchain,@dimension:attack_dimension,digit@status:dispose_status_cd,digit@host_state:attack_result_cd,@action:alert_desc,@attack_sip:attacker_ip,digit@hazard_level:severity,@white_id:is_white_list,@operate_system:os_name,@machineName:dev_name,@serial_num:dev_serial_num,@insScore:inspection_score,@result:protect_status, @score:behavior_score,@insLevel:inspection_status,@newMachineId:server_uuid,@destIpAddress:dip_geo,@osType:os_type,@localTimestamp:server_local_time,@action:ioc_desc,@backId:traceback_id,@userIdList:log_user,@srcEventId:origin_event_id,@srcIpAddress:sip_geo,@eventIdStr:event_id,@groupName:group_name,@phaseDesc:killchain_desc,@sowareVersion:software_version,@object:op_object,@type_chain:origin_alert_cat_cd,_@*))
     }
}
"#;

    let formatted = formatter.format_content(raw);
    let expected = "\
#[tag(dev_vendor: \"天眼分析平台\", dev_name: \"天眼分析平台\", dev_type: \"syslog\"), copy_raw(name:\"raw_msg\")]
package skyeye_platform {
     #[tag(log_desc: \"告警日志\", log_type: \"skyeye_platform_jowto_alert\", alert_src: \"52\")]
     rule skyeye_platform_jowto_alert {
        (
            _:pri<<,>>,
            5*_
        ),
        (
            time:update_time\\|\\!,
            ip:access_ip\\|\\!,
            symbol(yunsuo|!)
        ),
        (
            json(
                @dev_ip,
                @alarm_sip:victim_ip,
                @attck:attack_method,
                @alarm_id:alert_id,
                @access_time:occur_time,
                digit@group_id:asset_group_id,
                digit@phase:killchain,
                @dimension:attack_dimension,
                digit@status:dispose_status_cd,
                digit@host_state:attack_result_cd,
                @action:alert_desc,
                @attack_sip:attacker_ip,
                digit@hazard_level:severity,
                @white_id:is_white_list,
                @operate_system:os_name,
                @machineName:dev_name,
                @serial_num:dev_serial_num,
                @insScore:inspection_score,
                @result:protect_status,
                @score:behavior_score,
                @insLevel:inspection_status,
                @newMachineId:server_uuid,
                @destIpAddress:dip_geo,
                @osType:os_type,
                @localTimestamp:server_local_time,
                @action:ioc_desc,
                @backId:traceback_id,
                @userIdList:log_user,
                @srcEventId:origin_event_id,
                @srcIpAddress:sip_geo,
                @eventIdStr:event_id,
                @groupName:group_name,
                @phaseDesc:killchain_desc,
                @sowareVersion:software_version,
                @object:op_object,
                @type_chain:origin_alert_cat_cd,
                _@*
            )
        )
     }
}
";

    assert_eq!(
        formatted, expected,
        "跨行内联 json 也应被拆行且标记不丢失"
    );
}

#[test]
fn format_content_should_reflow_multiline_tuple_fields() {
    let formatter = WplFormatter::new();
    let raw = "\
(
    _:pri<<,>>,


    5*_
),
(time:update_time\\|\\!,ip:access_ip\\|\\!,
symbol(yunsuo|!))
";

    let formatted = formatter.format_content(raw);
    let expected = "\
(
    _:pri<<,>>,
    5*_
),
(
    time:update_time\\|\\!,
    ip:access_ip\\|\\!,
    symbol(yunsuo|!)
)
";

    assert_eq!(
        formatted, expected,
        "跨行元组字段应被压缩为一行一字段，逗号紧随字段"
    );
}
