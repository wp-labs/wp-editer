已接入日志：

|      | 规则名                              | 中文名                             | 数据表名                            | 样本                                                         |
| ---- | ----------------------------------- | ---------------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| 1    | das_apt_alert_log                   | 安恒APT探针告警日志                | das_apt_alert_log                   | (_, _, _, _, _)                                              |
| 2    | jowto_server_alert_log              | 椒图服务器告警日志                 | jowto_server_alert_log              | (:pri<<,>>,),(time:update_time),(symbol(registry.deploy),4*_), |
| 3    | jowto_server_alert_log_v1           | 椒图服务器告警日志                 | jowto_server_alert_log              | (:pri<<,>>),(time:update_time),(symbol(registry.deploy),),   |
| 4    | jowto_server_alert_log_dp           | 椒图服务器告警日志                 | jowto_server_alert_log              | type=flow_jowto_alert_log                                    |
| 5    | ngsoc_alert_info                    | NGSOC告警信息                      | ngsoc_alert_info                    | (:pri<<,>>),(time:update_time,,symbol(qax.ngsoc:)),          |
| 6    | ngsoc_threat_alert_send_dp          | NGSOC告警信息                      | ngsoc_threat_alert_send             | type=ngsoc_alert_info                                        |
| 7    | ngsoc_threat_alert_send_dp2         | NGSOC告警信息                      | ngsoc_threat_alert_send             | type=ngsoc_alert_info                                        |
| 8    | wx_alert_log                        | 青藤万相主机自适应安全平台告警日志 | wx_alert_log                        | (:pri<<,>>),(time:update_time, 2*),                          |
| 9    | skyeye_flow_webattack_kafka         | 天眼网页漏洞利用告警日志           | skyeye_flow_webattack               | message_desc=skyeye_webattack                                |
| 10   | skyeye_flow_td_ioc_kafka            | 天眼威胁情报告警日志               | skyeye_flow_td_ioc                  | message_desc=skyeye_ioc                                      |
| 11   | skyeye_flow_ids_kafka               | 天眼网络攻击告警日志               | skyeye_flow_ids                     | message_desc=skyeye_ids                                      |
| 12   | skyeye_flow_skyeye_webshell_kafka   | 天眼WEBSHELL上传日志               | skyeye_flow_webshell                | message_desc=skyeye_webshell                                 |
| 13   | skyeye_flow_webattack               | 天眼网页漏洞利用告警日志           | skyeye_flow_webattack               | (:pri<<,>>,5*),                                              |
| 14   | skyeye_flow_webattack_dp            | 天眼网页漏洞利用告警日志           | skyeye_flow_webattack               | type=flow_ty_webattack                                       |
| 15   | skyeye_flow_webshell                | 天眼WEBSHELL上传日志               | skyeye_flow_webshell                | (:pri<<,>>,5*),                                              |
| 16   | skyeye_flow_webshell_dp             | 天眼WEBSHELL上传日志               | skyeye_flow_webshell                | type=flow_ty_webshell                                        |
| 17   | skyeye_flow_ids                     | 天眼网络攻击告警日志               | skyeye_flow_ids                     | (:pri<<,>>,5*),                                              |
| 18   | skyeye_flow_ids_dp                  | 天眼网络攻击告警日志               | skyeye_flow_ids                     | type=flow_ty_attack                                          |
| 19   | skyeye_flow_td_ioc                  | 天眼威胁情报告警日志               | skyeye_flow_td_ioc                  | (:pri<<,>>,5*),                                              |
| 20   | skyeye_flow_td_ioc_dp               | 天眼威胁情报告警日志               | skyeye_flow_td_ioc                  | type=flow_ty_ioc                                             |
| 21   | skyeye_flow_web                     | WEB访问流量日志                    | flow_web                            | type=[skyeye_weblog, flow_web]                               |
| 22   | skyeye_flow_tcp                     | TCP流量日志                        | flow_tcp                            | type=skyeye_tcpflow                                          |
| 23   | skyeye_flow_dns                     | 域名解析流量日志                   | flow_dns                            | type=skyeye_dns                                              |
| 24   | skyeye_flow_udp                     | UDP流量日志                        | flow_udp                            | type=skyeye_udpflow                                          |
| 25   | virus_event                         | 计算系统恶意软件告警日志           | cs_malware_alert_log                | (:pri<<,>>,time:access_time, 2*, symbol(virus_event), _), (chars[), |
| 26   | cs_attack_alert_log/awp_threat_log  | 计算系统入侵告警日志               | cs_attack_alert_log                 | (:pri<<,>>,time:access_time, 2*, symbol(awp_threat_log), _),(chars[), |
| 27   | cs_attack_alert_log/anti_bfa        | 计算系统入侵告警日志               | cs_attack_alert_log                 | (:pri<<,>>,time:access_time, 2*, symbol(anti_bfa), _),(chars[), |
| 28   | cs_attack_alert_log/botnet          | 计算系统入侵告警日志               | cs_attack_alert_log                 | (:pri<<,>>,time:access_time, 2*, symbol(botnet), _),(chars[), |
| 29   | cs_attack_alert_log/webshell        | 计算系统入侵告警日志               | cs_attack_alert_log                 | (:pri<<,>>,time:access_time, 2*, symbol(webshell), _),(chars[), |
| 30   | cs_attack_alert_log/nofile_attack   | 计算系统入侵告警日志               | cs_attack_alert_log                 | (:pri<<,>>,time:access_time, 2*, symbol(nofile_attack), _),(chars[), |
| 31   | sip_atk_alarm_log                   | 深信服安全感知攻击告警日志         | sip_atk_alarm_log                   | chars \|(time_3339:time, time:time2),symbol(alarm),ip:access_ip, |
| 32   | sip_atk_alarm_log_v2                | 深信服安全感知攻击告警日志         | sip_atk_alarm_log                   | chars \|(_:pri<<,>>, time:update_time),symbol(alarm),ip:access_ip, |
| 33   | sip_sec_event_log                   | 深信服安全感知安全事件日志         | sip_sec_event_log                   | time:time,symbol(secevent),ip:access_ip,                     |
| 34   | flow_td_ioc                         | 天堤威胁情报告警日志               | flow_td_ioc                         | type=flow_td_ioc                                             |
| 35   | flow_td_virus                       | 天堤病毒告警日志                   | flow_td_virus                       | type=flow_td_virus                                           |
| 36   | flow_td_attack                      | 天堤网络攻击告警日志               | flow_td_attack                      | type=flow_td_attack                                          |
| 37   | flow_td_webattack                   | 天堤网页漏洞利用告警日志           | flow_td_webattack                   | type=flow_td_webattack                                       |
| 38   | edr_alert_log                       | 天擎终端威胁告警日志               | edr_alert_log                       | type=edr_alert                                               |
| 39   | edr_antivirus_virus                 | 天擎病毒查杀日志                   | edr_antivirus_virus                 | syslog_topic=antivirus_virus                                 |
| 40   | edr_antivirus_scan                  | 天擎查杀任务日志                   | edr_antivirus_scan                  | syslog_topic=antivirus_scan                                  |
| 41   | edr_attack_protection               | 天擎攻击防护日志                   | edr_attack_protection               | syslog_topic=attack_protection_log                           |
| 42   | edr_system_protection               | 天擎系统防护日志                   | edr_system_protection               | syslog_topic=system_protection_log                           |
| 43   | edr_webpage_protection              | 天擎网页安全防护日志               | edr_webpage_protection              | syslog_topic=webpage_protection_log                          |
| 44   | edr_firewall                        | 天擎防火墙日志                     | edr_firewall                        | syslog_topic=firewall                                        |
| 45   | edr_baseline_check_result           | 天擎基线检查结果日志               | edr_baseline_check_result           | syslog_topic=baseline_check_result                           |
| 46   | edr_baseline_check_detail           | 天擎基线检查明细日志               | edr_baseline_check_detail           | syslog_topic=baseline_check_detail                           |
| 47   | edr_process_log                     | 天擎进程管理日志                   | edr_process_log                     | syslog_topic=process_log                                     |
| 48   | edr_ssid_log                        | 天擎SSID防护日志                   | edr_ssid_log                        | syslog_topic=ssid_log                                        |
| 49   | edr_energy_manage_log               | 天擎能耗管理日志                   | edr_energy_manage_log               | syslog_topic=energy_manage_log                               |
| 50   | edr_net_out_log                     | 天擎V10违规外联日志                | edr_net_out_log                     | syslog_topic=net_out_log                                     |
| 51   | edr_external_device_alarm           | 天擎外设管理日志                   | edr_external_device_alarm           | syslog_topic=external_device_alarm                           |
| 52   | edr_remote_assistance_log           | 天擎远程协助日志                   | edr_remote_assistance_log           | syslog_topic=remote_assistance_log                           |
| 53   | edr_remote_assistance_file_transfer | 天擎远程文件传输日志               | edr_remote_assistance_file_transfer | syslog_topic=remote_assistance_file_transfer                 |
| 54   | cs_op_log                           | 计算系统操作日志                   | cs_op_log                           | exists(operator_name)                                        |
| 55   | edr_process_event                   | 天擎EDR进程事件                    | edr_process_event                   | type=process_details                                         |
| 56   | edr_file_op                         | 天擎EDR文件操作                    | edr_file_op                         | type=file_operations                                         |
| 57   | edr_wmi_event                       | 天擎EDR_WMI事件                    | edr_wmi_event                       | type=wmi_event                                               |
| 58   | edr_powershell_cmd_exec             | 天擎EDR_POWERSHELL命令执行         | edr_powershell_cmd_exec             | type=powershell_execute                                      |
| 59   | edr_account_change                  | 天擎EDR账号变更                    | edr_account_change                  | type=account_change,                                         |
| 60   | ignore                              |                                    |                                     | peek_symbol(check the port available)                        |
| 61   | ignore                              |                                    |                                     | \_:pri<<,>>,time:access_time, 2*_, symbol(operation_log)     |
| 62   | ignore                              |                                    |                                     | type=[login_logout,system_runtime_log,registry_changes,ip_access,dns_access,process_injection] |
| 63   | ignore_other                        |                                    |                                     | syslog_topic=[information_gathering_client_summary_result,patch_log] |