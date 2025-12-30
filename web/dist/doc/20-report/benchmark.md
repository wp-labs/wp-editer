# Performance BenchMark Report

4 种日志 * 3 种拓扑 * 2 种能力 * 2 种平台 * 2 种引擎。

## 范畴与指标
- 拓扑：File -> BlackHole、TCP -> BlackHole、TCP -> File。
- 能力：解析（Parse）；解析+转换（Parse+Transform）。
- 平台：Mac M4 Mini、Linux VPS。
- 引擎：WarpParse、Vector。
- 指标：EPS=Events Per Second，MPS（MiB/s, Messages Per Seconds)；CPU/MEM 取进程平均/峰值；规则大小为对应规则文件体积。
- 样本大小：Nginx 239B、AWS 411B、Sysmon 1K、APT 3K（单条日志）。

## 覆盖矩阵
| 维度     | 取值                                             |
| -------- | ------------------------------------------------ |
| 日志类型 | Nginx、AWS、Sysmon、APT                          |
| 拓扑     | File -> BlackHole、TCP -> BlackHole、TCP -> File |
| 能力     | 解析、解析+转换                                  |
| 平台     | Mac M4 Mini（数据就绪）、Linux VPS（数据筹备中） |
| 引擎     | WarpParse、Vector                                |

## 日志解析测试

### Mac M4 Mini
#### Nginx（239B）

##### WarpParse

###### WPL

```bash
package /nginx/ {
   rule nginx {
        (ip:sip,_^2,chars:timestamp<[,]>,http/request:http_request",chars:status,chars:size,chars:referer",http/agent:http_agent",_")
   }
}
```

###### output
```json
{
	"wp_event_id": 1764645169882925000,
	"sip": "180.57.30.148",
	"timestamp": "21/Jan/2025:01:40:02 +0800",
	"http_request": "GET /nginx-logo.png HTTP/1.1",
	"status": "500",
	"size": "368",
	"referer": "http://207.131.38.110/",
	"http_agent": "Mozilla/5.0(Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36 ",
	"wp_src_key": "socket",
	"wp_src_ip": "127.0.0.1"
}
```

##### Vector

###### VRL

``` bash
source = '''
  parsed = parse_regex!(.message, r'^(?P<client>\S+) \S+ \S+ \[(?P<time>[^\]]+)\] "(?P<request>[^"]*)" (?P<status>\d{3}) (?P<size>\d+) "(?P<referer>[^"]*)" "(?P<agent>[^"]*)" "(?P<extra>[^"]*)"')
  .sip = parsed.client
  .http_request = parsed.request
  .status = parsed.status
  .size = parsed.size
  .referer = parsed.referer
  .http_agent = parsed.agent
  .timestamp = parsed.time
  del(.message)
'''
```

###### output
```json
{
	"host": "127.0.0.1",
	"http_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36",
	"http_request": "GET /nginx-logo.png HTTP/1.1",
	"port": 58102,
	"referer": "http://207.131.38.110/",
	"sip": "180.57.30.148",
	"size": "368",
	"source_type": "socket",
	"status": "500",
	"timestamp": "21/Jan/2025:01:40:02 +0800"
}
```



| 引擎      | 拓扑                | EPS        | MPS   | CPU (avg/peak)             | MEM (avg/peak)             | 规则大小 |
| --------- | ------------------- | ---------- | ----- | -------------------------- | -------------------------- | -------- |
| WarpParse | File -> BlackHole | **2,456,100** | 559.81 | **684.40 % / 824.50 %** | **107.36 MB / 120.44 MB** | 174B |
|  | TCP -> BlackHole | **1,737,200** | 395.96 | **506.85 % / 650.90 %** | **426.09 MB /450.23 MB** |  |
|  | TCP -> File | **1,084,600** | 247.21 | **541.19 % / 722.40 %** | **696.63 MB / 699.62 MB** |  |
| Vector | File -> BlackHole | **540,540** | 123.20 | **341.51 % / 404.50 %** | **230.67 MB / 251.14 MB** | 416B |
|  | TCP -> BlackHole | **974,100** | 222.02 | **530.76 % / 660.60 %** | **233.23 MB / 238.45 MB** |  |
|  | TCP -> File | **91,200** | 20.79 | **186.35 % / 194.70 %** | **230.62 MB / 244.22 MB** |  |

> https://github.com/vectordotdev/vector/issues/20739?utm_source=chatgpt.com

#### AWS（411B)

##### WarpParse

###### WPL

```bash
package /aws/ {
   rule aws {
        (
            symbol(http),
            chars:timestamp,
            chars:elb,
            chars:client_host,
            chars:target_host,
            chars:request_processing_time,
            chars:target_processing_time,
            chars:response_processing_time,
            chars:elb_status_code,
            chars:target_status_code,
            chars:received_bytes,
            chars:sent_bytes,
            chars:request | (chars:request_method, chars:request_url, chars:request_protocol),
            chars:user_agent,
            chars:ssl_cipher,
            chars:ssl_protocol,
            chars:target_group_arn,
            chars:trace_id,
            chars:domain_name,
            chars:chosen_cert_arn,
            chars:matched_rule_priority,
            chars:request_creation_time,
            chars:actions_executed,
            chars:redirect_url,
            chars:error_reason,
            chars:target_port_list,
            chars:target_status_code_list,
            chars:classification,
            chars:classification_reason,
            chars:traceability_id,
        )
   }
   }
```

###### output
```json
{
	"wp_event_id": 1764646097464011000,
	"symbol": "http",
	"timestamp": "2018-11-30T22:23:00.186641Z",
	"elb": "app/my-lb",
	"client_host": "192.168.1.10:2000",
	"target_host": "10.0.0.15:8080",
	"request_processing_time": "0.01",
	"target_processing_time": "0.02",
	"response_processing_time": "0.01",
	"elb_status_code": "200",
	"target_status_code": "200",
	"received_bytes": "100",
	"sent_bytes": "200",
	"request_method": "POST",
	"request_url": "https://api.example.com/u?p=1&sid=2&t=3",
	"request_protocol": "HTTP/1.1",
	"user_agent": "Mozilla/5.0 (Win) Chrome/90",
	"ssl_cipher": "ECDHE",
	"ssl_protocol": "TLSv1.3",
	"target_group_arn": "arn:aws:elb:us:123:tg",
	"trace_id": "Root=1-test",
	"domain_name": "api.example.com",
	"chosen_cert_arn": "arn:aws:acm:us:123:cert/short",
	"matched_rule_priority": "1",
	"request_creation_time": "2018-11-30T22:22:48.364000Z",
	"actions_executed": "forward",
	"redirect_url": "https://auth.example.com/r",
	"error_reason": "err",
	"target_port_list": "10.0.0.1:80",
	"target_status_code_list": "200",
	"classification": "cls",
	"classification_reason": "rsn",
	"traceability_id": "TID_x1",
	"wp_src_key": "socket",
	"wp_src_ip": "127.0.0.1"
}
```

##### Vector

###### VRL

```bash
source = '''
  parsed = parse_regex!(.message, r'^(?P<type>\S+) (?P<timestamp>\S+) (?P<elb>\S+) (?P<client_host>\S+) (?P<target_host>\S+) (?P<request_processing_time>[-\d\.]+) (?P<target_processing_time>[-\d\.]+) (?P<response_processing_time>[-\d\.]+) (?P<elb_status_code>\S+) (?P<target_status_code>\S+) (?P<received_bytes>\d+) (?P<sent_bytes>\d+) "(?P<request_method>\S+) (?P<request_url>[^ ]+) (?P<request_protocol>[^"]+)" "(?P<user_agent>[^"]*)" "(?P<ssl_cipher>[^"]*)" "(?P<ssl_protocol>[^"]*)" (?P<target_group_arn>\S+) "(?P<trace_id>[^"]*)" "(?P<domain_name>[^"]*)" "(?P<chosen_cert_arn>[^"]*)" (?P<matched_rule_priority>\S+) (?P<request_creation_time>\S+) "(?P<actions_executed>[^"]*)" "(?P<redirect_url>[^"]*)" "(?P<error_reason>[^"]*)" "(?P<target_port_list>[^"]*)" "(?P<target_status_code_list>[^"]*)" "(?P<classification>[^"]*)" "(?P<classification_reason>[^"]*)" (?P<traceability_id>\S+)$')
  .timestamp = parsed.timestamp
  .symbol = parsed.type
  .elb = parsed.elb
  .client_host = parsed.client_host
  .target_host = parsed.target_host
  .request_processing_time = parsed.request_processing_time
  .target_processing_time = parsed.target_processing_time
  .response_processing_time = parsed.response_processing_time
  .elb_status_code = parsed.elb_status_code
  .target_status_code = parsed.target_status_code
  .received_bytes = parsed.received_bytes
  .sent_bytes = parsed.sent_bytes
  .request_method = parsed.request_method
  .request_url = parsed.request_url
  .request_protocol = parsed.request_protocol
  .user_agent = parsed.user_agent
  .ssl_cipher = parsed.ssl_cipher
  .ssl_protocol = parsed.ssl_protocol
  .target_group_arn = parsed.target_group_arn
  .trace_id = parsed.trace_id
  .domain_name = parsed.domain_name
  .chosen_cert_arn = parsed.chosen_cert_arn
  .matched_rule_priority = parsed.matched_rule_priority
  .request_creation_time = parsed.request_creation_time
  .actions_executed = parsed.actions_executed
  .redirect_url = parsed.redirect_url
  .error_reason = parsed.error_reason
  .target_port_list = parsed.target_port_list
  .target_status_code_list = parsed.target_status_code_list
  .classification = parsed.classification
  .classification_reason = parsed.classification_reason
  .traceability_id = parsed.traceability_id
  del(.message)
'''
```

###### output
```json
{
	"actions_executed": "forward",
	"chosen_cert_arn": "arn:aws:acm:us:123:cert/short",
	"classification": "cls",
	"classification_reason": "rsn",
	"client_host": "192.168.1.10:2000",
	"domain_name": "api.example.com",
	"elb": "app/my-lb",
	"elb_status_code": "200",
	"error_reason": "err",
	"host": "127.0.0.1",
	"matched_rule_priority": "1",
	"port": 58786,
	"received_bytes": "100",
	"redirect_url": "https://auth.example.com/r",
	"request_creation_time": "2018-11-30T22:22:48.364000Z",
	"request_method": "POST",
	"request_processing_time": "0.01",
	"request_protocol": "HTTP/1.1",
	"request_url": "https://api.example.com/u?p=1&sid=2&t=3",
	"response_processing_time": "0.01",
	"sent_bytes": "200",
	"source_type": "socket",
	"ssl_cipher": "ECDHE",
	"ssl_protocol": "TLSv1.3",
	"symbol": "http",
	"target_group_arn": "arn:aws:elb:us:123:tg",
	"target_host": "10.0.0.15:8080",
	"target_port_list": "10.0.0.1:80",
	"target_processing_time": "0.02",
	"target_status_code": "200",
	"target_status_code_list": "200",
	"timestamp": "2018-11-30T22:23:00.186641Z",
	"trace_id": "Root=1-test",
	"traceability_id": "TID_x1",
	"user_agent": "Mozilla/5.0 (Win) Chrome/90"
}
```



| 引擎      | 拓扑                | EPS        | MPS   | CPU (avg/peak)             | MEM (avg/peak)             | 规则大小 |
| --------- | ------------------- | ---------- | ----- | -------------------------- | -------------------------- | -------- |
| WarpParse | File -> BlackHole | **1,012,400** | 396.82 | **826.53 % / 937.80 %** | **237.05 MB / 263.53 MB** | 1153B |
|  | TCP -> BlackHole | **846,000** | 331.60 | **554.38 % / 710.90 %** | **323.86 MB / 326.97 MB** |  |
|  | TCP -> File | **347,800** | 136.32 | **495.90 % / 615.00 %** | **481.30 MB /847.70 MB** |  |
| Vector | File -> BlackHole | **158,730** | 62.22 | **633.77 % / 730.30 %** | **296.87 MB / 307.42 MB** | 2289B |
|  | TCP -> BlackHole | **163,600** | 64.12 | **628.67 % / 674.60 %** | **264.21 MB / 275.98 MB** |  |
|  | TCP -> File | **74,700** | 29.28 | **374.47 % / 409.50 %** | **264.70 MB / 273.64 MB** |  |

#### Sysmon（1K,JSON)

##### WarpParse

###### WPL

```bash
package /sysmon/ {
   rule sysmon {
        (_:pri<<,>>,3*_,_),(_\S\y\s\m\o\n\:,
        json(
            @Id:id,
            @Description/ProcessId:process_id,
            @Level:severity,
            @Opcode:Opcode,
            @ProcessId:ProcessId,
            @Task:Task,
            @ThreadId:ThreadId
            @Version:Version,
            @Description/CommandLine:cmd_line,
            @Description/ParentCommandLine:parent_cmd_line,
            @Description/LogonGuid:logon_guid,
            @Description/LogonId:logon_id,
            @Description/Image:process_path,
            @Description/ParentImage:parent_process_path,
            @Description/ParentProcessGuid:parent_process_guid,
            @Description/ParentProcessId:parent_process_id,
            @Description/ParentUser:parent_process_user,
            @Description/ProcessGuid:process_guid,
            @Description/Company:product_company,
            @Description/Description:process_desc,
            @Description/FileVersion:file_version,
            chars@Description/Hashes:Hashes
            @Description/IntegrityLevel:integrity_level,
            @Description/OriginalFileName:origin_file_name,
            @Description/Product:product_name,
            @Description/RuleName:rule_name,
            @Description/User:user_name,
            chars@Description/UtcTime:occur_time,
            @Description/TerminalSessionId:terminal_session_id,
            @Description/CurrentDirectory:current_dir,
            @Keywords:keywords
            )
        )
    }
   }
```

###### output

```json
{
	"wp_event_id": 1764657738662604000,
	"cmd_line": "a.exe",
	"product_company": "C",
	"current_dir": "C:\\\\",
	"process_desc": "D",
	"file_version": "1",
	"Hashes": "H",
	"process_path": "C:\\\\Windows\\\\a.exe",
	"integrity_level": "M",
	"logon_guid": "{LG}",
	"logon_id": "1",
	"origin_file_name": "a.exe",
	"parent_cmd_line": "b.exe",
	"parent_process_path": "C:\\\\Windows\\\\b.exe",
	"parent_process_guid": "{PG}",
	"parent_process_id": "1",
	"parent_process_user": "U",
	"process_guid": "{G}",
	"process_id": "1",
	"product_name": "P",
	"rule_name": "R",
	"terminal_session_id": "1",
	"user_name": "U",
	"occur_time": "2025-04-10 06:17:28.503",
	"DescriptionRawMessage": "Process Create\\r\\nRuleName: R",
	"id": "1",
	"keywords": "0",
	"severity": "4",
	"LevelDisplayName": "信息",
	"LogName": "L",
	"MachineName": "A",
	"Opcode": "0",
	"OpcodeDisplayName": "信息",
	"ProcessId": "1",
	"ProviderId": "PID",
	"ProviderName": "P",
	"Task": "1",
	"TaskDisplayName": "Process Create",
	"ThreadId": "1",
	"TimeCreated": "2025-04-10T14:17:28.693228+08:00",
	"Version": "1",
	"wp_src_key": "socket",
	"wp_src_ip": "127.0.0.1"
}
```

##### Vector

###### VRL

```bash
source = '''
  parsed_msg = parse_regex!(.message, r'^[^{]*(?P<body>\{.*)$')
  parsed = parse_regex!(parsed_msg.body, r'(?s)\{"Id":(?P<Id>[^,]+),"Version":(?P<Version>[^,]+),"Level":(?P<Level>[^,]+),"Task":(?P<Task>[^,]+),"Opcode":(?P<Opcode>[^,]+),"Keywords":(?P<Keywords>[^,]+),"RecordId":(?P<RecordId>[^,]+),"ProviderName":"(?P<ProviderName>[^"]*)","ProviderId":"(?P<ProviderId>[^"]*)","LogName":"(?P<LogName>[^"]*)","ProcessId":(?P<ProcessId>[^,]+),"ThreadId":(?P<ThreadId>[^,]+),"MachineName":"(?P<MachineName>[^"]*)","TimeCreated":"(?P<TimeCreated>[^"]*)","ActivityId":(?P<ActivityId>[^,]+),"RelatedActivityId":(?P<RelatedActivityId>[^,]+),"Qualifiers":(?P<Qualifiers>[^,]+),"LevelDisplayName":"(?P<LevelDisplayName>[^"]*)","OpcodeDisplayName":"(?P<OpcodeDisplayName>[^"]*)","TaskDisplayName":"(?P<TaskDisplayName>[^"]*)","Description":\{"RuleName":"(?P<RuleName>[^"]*)","UtcTime":"(?P<UtcTime>[^"]*)","ProcessGuid":"(?P<ProcessGuid>[^"]*)","ProcessId":"(?P<DescProcessId>[^"]*)","Image":"(?P<Image>[^"]*)","FileVersion":"(?P<FileVersion>[^"]*)","Description":"(?P<Description>[^"]*)","Product":"(?P<Product>[^"]*)","Company":"(?P<Company>[^"]*)","OriginalFileName":"(?P<OriginalFileName>[^"]*)","CommandLine":"(?P<CommandLine>[^"]*)","CurrentDirectory":"(?P<CurrentDirectory>[^"]*)","User":"(?P<User>[^"]*)","LogonGuid":"(?P<LogonGuid>[^"]*)","LogonId":"(?P<LogonId>[^"]*)","TerminalSessionId":"(?P<TerminalSessionId>[^"]*)","IntegrityLevel":"(?P<IntegrityLevel>[^"]*)","Hashes":"(?P<Hashes>[^"]*)","ParentProcessGuid":"(?P<ParentProcessGuid>[^"]*)","ParentProcessId":"(?P<ParentProcessId>[^"]*)","ParentImage":"(?P<ParentImage>[^"]*)","ParentCommandLine":"(?P<ParentCommandLine>[^"]*)","ParentUser":"(?P<ParentUser>[^"]*)"\},"DescriptionRawMessage":"(?P<DescriptionRawMessage>[^"]*)"\}$')
  .cmd_line = parsed.CommandLine
  .product_company = parsed.Company
  .process_id = parsed.ProcessId
  .Opcode = parsed.Opcode
  .ProcessId = parsed.ProcessId 
  .Task = parsed.Task
  .ThreadId = parsed.ThreadId
  .Version = parsed.Version
  .current_dir = parsed.CurrentDirectory
  .process_desc = parsed.Description
  .file_version = parsed.FileVersion
  .Hashes = parsed.Hashes
  .process_path = parsed.Image
  .integrity_level = parsed.IntegrityLevel
  .logon_guid = parsed.LogonGuid
  .logon_id = parsed.LogonId
  .origin_file_name = parsed.OriginalFileName
  .parent_cmd_line = parsed.ParentCommandLine
  .parent_process_path = parsed.ParentImage
  .parent_process_guid = parsed.ParentProcessGuid
  .parent_process_id = parsed.ParentProcessId
  .parent_process_user = parsed.ParentUser
  .process_guid = parsed.ProcessGuid
  .product_name = parsed.Product
  .rule_name = parsed.RuleName
  .terminal_session_id = parsed.TerminalSessionId
  .user_name = parsed.User
  .occur_time = parsed.UtcTime
  .DescriptionRawMessage = parsed.DescriptionRawMessage
  .id = parsed.Id
  .keywords = parsed.Keywords
  .severity = parsed.Level
  .LevelDisplayName = parsed.LevelDisplayName
  .LogName = parsed.LogName
  .MachineName = parsed.MachineName
  .OpcodeDisplayName = parsed.OpcodeDisplayName
  .ProviderId = parsed.ProviderId
  .ProviderName = parsed.ProviderName
  .TaskDisplayName = parsed.TaskDisplayName
  .TimeCreated = parsed.TimeCreated
  del(.message)
```

###### output

```json
{
	"DescriptionRawMessage": "Process Create\\r\\nRuleName: R",
	"Hashes": "H",
	"LevelDisplayName": "信息",
	"LogName": "L",
	"MachineName": "A",
	"Opcode": "0",
	"OpcodeDisplayName": "信息",
	"ProcessId": "1",
	"ProviderId": "PID",
	"ProviderName": "P",
	"Task": "1",
	"TaskDisplayName": "Process Create",
	"ThreadId": "1",
	"TimeCreated": "2025-04-10T14:17:28.693228+08:00",
	"Version": "1",
	"cmd_line": "a.exe",
	"current_dir": "C:\\\\",
	"file_version": "1",
	"host": "127.0.0.1",
	"id": "1",
	"integrity_level": "M",
	"keywords": "0",
	"logon_guid": "{LG}",
	"logon_id": "1",
	"occur_time": "2025-04-10 06:17:28.503",
	"origin_file_name": "a.exe",
	"parent_cmd_line": "b.exe",
	"parent_process_guid": "{PG}",
	"parent_process_id": "1",
	"parent_process_path": "C:\\\\Windows\\\\b.exe",
	"parent_process_user": "U",
	"port": 50558,
	"process_desc": "D",
	"process_guid": "{G}",
	"process_id": "1",
	"process_path": "C:\\\\Windows\\\\a.exe",
	"product_company": "C",
	"product_name": "P",
	"rule_name": "R",
	"severity": "4",
	"source_type": "socket",
	"terminal_session_id": "1",
	"timestamp": "2025-12-02T06:33:53.716258Z",
	"user_name": "U"
}
```



| 引擎      | 拓扑                | EPS       | MPS   | CPU (avg/peak)             | MEM (avg/peak)             | 规则大小 |
| --------- | ------------------- | --------- | ----- | -------------------------- | -------------------------- | -------- |
| WarpParse | File -> BlackHole | **440,000** | 413.74 | **852.01 % / 943.50 %** | **223.52 MB / 338.05 MB** | 1552B |
|  | TCP -> BlackHole | **418,900** | 393.90 | **720.42 % / 814.70 %** | **455.91 MB / 461.02 MB** |  |
|  | TCP -> File | **279,700** | 263.01 | **713.18 % / 789.30 %** | **441.34 MB / 453.27 MB** |  |
| Vector | File -> BlackHole | **76,717** | 72.14 | **462.81 % / 563.70 %** | **294.87 MB / 312.77 MB** | 3259B |
|  | TCP -> BlackHole | **111,900** | 105.22 | **720.04 % / 808.80 %** | **362.95 MB / 376.90 MB** |  |
|  | TCP -> File | **62,100** | 58.39 | **471.40 % / 543.40 %** | **343.65 MB / 355.57 MB** |  |

#### APT（3K)

##### WarpParse

###### WPL

``` bash
package /apt/ {
   rule apt {
        (
            _\#,
            time:timestamp,
            _,
            chars:Hostname,
            _\%\%, 
            chars:ModuleName\/,
            chars:SeverityHeader\/,
            symbol(ANTI-APT)\(,
            chars:type\),
            chars:Count<[,]>,
            _\:,
            chars:Content\(,
        ),
        (
            kv(chars@SyslogId),
            kv(chars@VSys),
            kv(chars@Policy),
            kv(chars@SrcIp),
            kv(chars@DstIp),
            kv(chars@SrcPort),
            kv(chars@DstPort),
            kv(chars@SrcZone),
            kv(chars@DstZone),
            kv(chars@User),
            kv(chars@Protocol),
            kv(chars@Application),
            kv(chars@Profile),
            kv(chars@Direction),
            kv(chars@ThreatType),
            kv(chars@ThreatName),
            kv(chars@Action),
            kv(chars@FileType),
            kv(chars@Hash)\),
        )\,
    }
   }

```

###### output

```json
{
	"wp_event_id": 1764661811871722000,
	"timestamp": "2025-02-07 15:07:18",
	"Hostname": "USG1000E",
	"ModuleName": "01ANTI-APT",
	"SeverityHeader": "4",
	"symbol": "ANTI-APT",
	"type": "l",
	"Count": "29",
	"Content": "An advanced persistent threat was detected.",
	"SyslogId": "1",
	"VSys": "public-long-virtual-system-name-for-testing-extra-large-value-to-simulate-enterprise-scenario",
	"Policy": "trust-untrust-high-risk-policy-with-deep-inspection-and-layer7-protection-enabled-for-advanced-threat-detection",
	"SrcIp": "192.168.1.123",
	"DstIp": "182.150.63.102",
	"SrcPort": "51784",
	"DstPort": "10781",
	"SrcZone": "trust-zone-with-multiple-segments-for-internal-security-domains-and-access-control",
	"DstZone": "untrust-wide-area-network-zone-with-external-facing-interfaces-and-honeynet-integration",
	"User": "unknown-long-user-field-used-for-simulation-purpose-with-extra-description-and-tags-[tag1][tag2][tag3]-to-reach-required-size",
	"Protocol": "TCP",
	"Application": "HTTP-long-application-signature-identification-with-multiple-behavior-patterns-and-deep-packet-inspection-enabled",
	"Profile": "IPS_default_advanced_extended_profile_with_ml_detection-long",
	"Direction": "aaa-long-direction-field-used-to-extend-size-with-additional-info-about-traffic-orientation-from-client-to-server",
	"ThreatType": "File Reputation with additional descriptive context of multi-layer analysis engine including sandbox-behavioral-signature-ml-static-analysis-and-network-correlation-modules-working-together",
	"ThreatName": "bbb-advanced-threat-campaign-with-code-name-operation-shadow-storm-and-related-IOCs-collected-over-multiple-incidents-in-the-wild-attached-metadata-[phase1][phase2][phase3]",
	"Action": "ccc-block-and-alert-with-deep-scan-followed-by-quarantine-and-forensic-dump-generation-for-further-investigation",
	"FileType": "ddd-executable-binary-with-multiple-packed-layers-suspicious-import-table-behavior-and-evasion-techniques",
	"Hash": "eee1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef-long-hash-value-used-for-testing-purpose-extended-with-multiple-hash-representations-[MD5:aaa111bbb222ccc333]-[SHA1:bbb222ccc333ddd444]-[SHA256:ccc333ddd444eee555]-[SSDEEP:ddd444eee555fff666]-end-of-hash-section, ExtraInfo=\"This is additional extended information purposely added to inflate the total log size for stress testing of log ingestion engines such as Vector, Fluent Bit, self-developed ETL pipelines, and any high-throughput log processing systems. It contains repeated segments to simulate realistic verbose threat intelligence attachment blocks. [SEG-A-BEGIN] The threat was part of a coordinated multi-vector campaign observed across various geographic regions targeting enterprise networks with spear-phishing, watering-hole attacks, and supply-chain compromise vectors. Enriched indicators include C2 domains, malware families, behavioral clusters, sandbox detonation traces, and network telemetry correlation. [SEG-A-END] [SEG-B-BEGIN] Further analysis revealed that the payload exhibited persistence techniques including registry autoruns, scheduled tasks, masquerading, process injection, and lateral movement attempts leveraging remote service creation and stolen credentials. The binary contains multiple obfuscation layers, anti-debugging, anti-VM checks, and unusual API call sequences. [SEG-B-END] [SEG-C-BEGIN] IOC Bundle: Domains=malicious-domain-example-01.com,malicious-domain-example-02.net,malicious-update-service.info; IPs=103.21.244.0,198.51.100.55,203.0.113.77; FileNames=update_service.exe,winlog_service.dll,mscore_update.bin; RegistryKeys=HKCU\\\\Software\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Run,HKLM\\\\System\\\\Services\\\\FakeService; Mutex=Global\\\\A1B2C3D4E5F6G7H8; YARA Matches=[rule1,rule2,rule3]. [SEG-C-END] EndOfExtraInfo\"",
	"wp_src_key": "socket",
	"wp_src_ip": "127.0.0.1"
}
```

##### Vector

###### VRL

```bash
source = '''
  parsed_log = parse_regex!(.message, r'(?s)^#(?P<timestamp>\w+\s+\d+\s+\d{4}\s+\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2})\s+(?P<hostname>\S+)\s+%%(?P<ModuleName>\d+[^/]+)/(?P<SeverityHeader>\d+)/(?P<symbol>[^(]+)\((?P<type>[^)]+)\)\[(?P<count>\d+)\]:\s*(?P<content>[^()]+?)\s*\(SyslogId=(?P<SyslogId>[^,]+),\s+VSys="(?P<VSys>[^"]+)",\s+Policy="(?P<Policy>[^"]+)",\s+SrcIp=(?P<SrcIp>[^,]+),\s+DstIp=(?P<DstIp>[^,]+),\s+SrcPort=(?P<SrcPort>[^,]+),\s+DstPort=(?P<DstPort>[^,]+),\s+SrcZone=(?P<SrcZone>[^,]+),\s+DstZone=(?P<DstZone>[^,]+),\s+User="(?P<User>[^"]+)",\s+Protocol=(?P<Protocol>[^,]+),\s+Application="(?P<Application>[^"]+)",\s+Profile="(?P<Profile>[^"]+)",\s+Direction=(?P<Direction>[^,]+),\s+ThreatType=(?P<ThreatType>[^,]+),\s+ThreatName=(?P<ThreatName>[^,]+),\s+Action=(?P<Action>[^,]+),\s+FileType=(?P<FileType>[^,]+),\s+Hash=(?P<Hash>.*)\)$')
  .Hostname = parsed_log.hostname
  .SrcPort = parsed_log.SrcPort
  .SeverityHeader = parsed_log.SeverityHeader
  .type = parsed_log.type
  .Count = parsed_log.count
  .Content = parsed_log.content
  .VSys = parsed_log.VSys
  .DstPort = parsed_log.DstPort
  .Policy = parsed_log.Policy
  .SrcIp = parsed_log.SrcIp
  .DstIp = parsed_log.DstIp
  .SrcZone = parsed_log.SrcZone
  .DstZone = parsed_log.DstZone
  .User = parsed_log.User
  .Protocol = parsed_log.Protocol
  .ModuleName = parsed_log.ModuleName
  .symbol = parsed_log.symbol
  .timestamp = parsed_log.timestamp
  .SyslogId = parsed_log.SyslogId
  .Application = parsed_log.Application
  .Profile = parsed_log.Profile
  .Direction = parsed_log.Direction
  .ThreatType = parsed_log.ThreatType
  .ThreatName = parsed_log.ThreatName
  .Action = parsed_log.Action
  .FileType = parsed_log.FileType
  .Hash = parsed_log.Hash
  del(.message)
'''
```

###### output

```json
{
	"Action": "ccc-block-and-alert-with-deep-scan-followed-by-quarantine-and-forensic-dump-generation-for-further-investigation",
	"Application": "HTTP-long-application-signature-identification-with-multiple-behavior-patterns-and-deep-packet-inspection-enabled",
	"Content": "An advanced persistent threat was detected.",
	"Count": "29",
	"Direction": "aaa-long-direction-field-used-to-extend-size-with-additional-info-about-traffic-orientation-from-client-to-server",
	"DstIp": "182.150.63.102",
	"DstPort": "10781",
	"DstZone": "untrust-wide-area-network-zone-with-external-facing-interfaces-and-honeynet-integration",
	"FileType": "ddd-executable-binary-with-multiple-packed-layers-suspicious-import-table-behavior-and-evasion-techniques",
	"Hash": "eee1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef-long-hash-value-used-for-testing-purpose-extended-with-multiple-hash-representations-[MD5:aaa111bbb222ccc333]-[SHA1:bbb222ccc333ddd444]-[SHA256:ccc333ddd444eee555]-[SSDEEP:ddd444eee555fff666]-end-of-hash-section, ExtraInfo=\"This is additional extended information purposely added to inflate the total log size for stress testing of log ingestion engines such as Vector, Fluent Bit, self-developed ETL pipelines, and any high-throughput log processing systems. It contains repeated segments to simulate realistic verbose threat intelligence attachment blocks. [SEG-A-BEGIN] The threat was part of a coordinated multi-vector campaign observed across various geographic regions targeting enterprise networks with spear-phishing, watering-hole attacks, and supply-chain compromise vectors. Enriched indicators include C2 domains, malware families, behavioral clusters, sandbox detonation traces, and network telemetry correlation. [SEG-A-END] [SEG-B-BEGIN] Further analysis revealed that the payload exhibited persistence techniques including registry autoruns, scheduled tasks, masquerading, process injection, and lateral movement attempts leveraging remote service creation and stolen credentials. The binary contains multiple obfuscation layers, anti-debugging, anti-VM checks, and unusual API call sequences. [SEG-B-END] [SEG-C-BEGIN] IOC Bundle: Domains=malicious-domain-example-01.com,malicious-domain-example-02.net,malicious-update-service.info; IPs=103.21.244.0,198.51.100.55,203.0.113.77; FileNames=update_service.exe,winlog_service.dll,mscore_update.bin; RegistryKeys=HKCU\\\\Software\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Run,HKLM\\\\System\\\\Services\\\\FakeService; Mutex=Global\\\\A1B2C3D4E5F6G7H8; YARA Matches=[rule1,rule2,rule3]. [SEG-C-END] EndOfExtraInfo\"",
	"Hostname": "USG1000E",
	"ModuleName": "01ANTI-APT",
	"Policy": "trust-untrust-high-risk-policy-with-deep-inspection-and-layer7-protection-enabled-for-advanced-threat-detection",
	"Profile": "IPS_default_advanced_extended_profile_with_ml_detection-long",
	"Protocol": "TCP",
	"SeverityHeader": "4",
	"SrcIp": "192.168.1.123",
	"SrcPort": "51784",
	"SrcZone": "trust-zone-with-multiple-segments-for-internal-security-domains-and-access-control",
	"SyslogId": "1",
	"ThreatName": "bbb-advanced-threat-campaign-with-code-name-operation-shadow-storm-and-related-IOCs-collected-over-multiple-incidents-in-the-wild-attached-metadata-[phase1][phase2][phase3]",
	"ThreatType": "File Reputation with additional descriptive context of multi-layer analysis engine including sandbox-behavioral-signature-ml-static-analysis-and-network-correlation-modules-working-together",
	"User": "unknown-long-user-field-used-for-simulation-purpose-with-extra-description-and-tags-[tag1][tag2][tag3]-to-reach-required-size",
	"VSys": "public-long-virtual-system-name-for-testing-extra-large-value-to-simulate-enterprise-scenario",
	"host": "127.0.0.1",
	"port": 55771,
	"source_type": "socket",
	"symbol": "ANTI-APT",
	"timestamp": "Feb  7 2025 15:07:18+08:00",
	"type": "l"
}
```



| 引擎      | 拓扑              | EPS         | MPS   | CPU (avg/peak)             | MEM (avg/peak)             | 规则大小 |
| --------- | ----------------- | ----------- | ----- | -------------------------- | -------------------------- | -------- |
| WarpParse | File -> BlackHole | **314,200** | 1062.84 | **700.03 % / 826.30 %** | **175.63 MB / 181.05 MB** | 985B |
|  | TCP -> BlackHole | **298,200** | 1008.72 | **693.55 % / 762.10 %** | **408.87 MB / 481.27 MB** |  |
|  | TCP -> File | **179,600** | 607.53 | **605.69 % / 853.20 %** | **1016.06 MB/ 1987.94 MB** |  |
| Vector | File -> BlackHole | **33,614** | 113.71 | **563.18 % / 677.50 %** | **261.19 MB / 278.39 MB** | 1759B |
|  | TCP -> BlackHole | **46,100** | 155.94 | **849.30 % / 921.50 %** | **421.18 MB / 445.80 MB** |  |
|  | TCP -> File | **36,200** | 122.45 | **688.47 % / 754.70 %** | **368.91 MB / 397.16 MB** |  |
---

## 日志解析转换测试
### Mac M4 Mini
#### Nginx（239B）

WarpParse
###### WPL

```bash
package /nginx/ {
   rule nginx {
        (ip:sip,_^2,chars:timestamp<[,]>,http/request",chars:status,chars:size,chars:referer",http/agent",_")
   }
}
```

###### OML

``` bash
name : nginx
rule : /nginx/*
---
size : digit = take(size);
status : digit = take(status);
str_status = match read(option:[status]) {
    digit(500) => chars(Internal Server Error);
    digit(404) => chars(Not Found); 
};
match_chars = match read(option:[wp_src_ip]) {
    ip(127.0.0.1) => chars(localhost); 
    !ip(127.0.0.1) => chars(attack_ip); 
};
* : auto = read();
```

###### output

``` bash
{
	"host": "127.0.0.1",
	"http_agent": "Mozilla/5.0(Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36 ",
	"http_request": "GET /nginx-logo.png HTTP/1.1",
	"match_chars": "localhost",
	"referer": "http://207.131.38.110/",
	"sip": "180.57.30.148",
	"size": 368,
	"source_type": "socket",
	"status": 500,
	"str_status": "Internal Server Error",
	"timestamp": "21/Jan/2025:01:40:02 +0800"
}
```

##### Vector

###### VRL

``` toml
source = '''
  parsed = parse_regex!(.message, r'^(?P<client>\S+) \S+ \S+ \[(?P<time>[^\]]+)\] "(?P<request>[^"]*)" (?P<status>\d{3}) (?P<size>\d+) "(?P<referer>[^"]*)" "(?P<agent>[^"]*)" "(?P<extra>[^"]*)"')
  .sip = parsed.client
  .http_request = parsed.request
  .referer = parsed.referer
  .http_agent = parsed.agent
  .timestamp = parsed.time
  del(.message)
  .status = to_int!(parsed.status)
  .size = to_int!(parsed.size)
if .host == "127.0.0.1" {
    .match_chars = "localhost"
} else if .host != "127.0.0.1" {
    .match_chars = "attack_ip"
}  
if .status == 500 {
    .str_status = "Internal Server Error"
} else if .status == 404 {
    .str_status = "Not Found"
}  
'''
```

###### output

``` bash
{
	"host": "127.0.0.1",
	"http_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36",
	"http_request": "GET /nginx-logo.png HTTP/1.1",
	"match_chars": "localhost",
	"port": 53894,
	"referer": "http://207.131.38.110/",
	"sip": "180.57.30.148",
	"size": 368,
	"source_type": "socket",
	"status": 500,
	"str_status": "Internal Server Error",
	"timestamp": "21/Jan/2025:01:40:02 +0800"
}
```

| 引擎 | 拓扑 | EPS | MPS | CPU (avg/peak) | MEM (avg/peak) | 规则大小 |
| --- | --- | --- | --- | --- | --- | --- |
|   WarpParse   |   File -> BlackHole   |   **1,749,200**   | 398.69 |   **762.65 %/865.70 %**   | **143.16 MB/159.22 MB** |   521        |
|   WarpParse   |   TCP -> BlackHole    |   **1,219,100**   | 277.87 |   **485.37 %/625.20 %**   |   **415.22 MB/440.52 MB**   |              |
|   WarpParse   |   TCP -> File         |   **797,700**   | 181.82 |   **492.15 %/621.20 %**   |   **523.97 MB/540.97 MB**   |              |
|   Vector      |   File -> BlackHole   |   **470,312**   | 107.20 |   **372.09 %/423.00 %**   |   **254.05 MB/280.03 MB**   |   682        |
|   Vector      |   TCP -> BlackHole    |   **870,500**   | 198.41 |   **514.06 %/639.90 %**   |   **238.50 MB/258.02 MB**   |              |
|   Vector      |   TCP -> File         |   **708,00**   | 16.14 |   **160.79 %/180.60 %**   |   **226.58 MB/236.41 MB**   |              |

#### AWS（411B)

WarpParse
###### WPL

```bash
package /aws/ {
   rule aws {
        (
            symbol(http),
            chars:timestamp,
            chars:elb,
            chars:client_host,
            chars:target_host,
            chars:request_processing_time,
            chars:target_processing_time,
            chars:response_processing_time,
            chars:elb_status_code,
            chars:target_status_code,
            chars:received_bytes,
            chars:sent_bytes,
            chars:request | (chars:request_method, chars:request_url, chars:request_protocol),
            chars:user_agent,
            chars:ssl_cipher,
            chars:ssl_protocol,
            chars:target_group_arn,
            chars:trace_id,
            chars:domain_name,
            chars:chosen_cert_arn,
            chars:matched_rule_priority,
            chars:request_creation_time,
            chars:actions_executed,
            chars:redirect_url,
            chars:error_reason,
            chars:target_port_list,
            chars:target_status_code_list,
            chars:classification,
            chars:classification_reason,
            chars:traceability_id,
        )
   }
   }
```

###### OML

``` bash
name : aws
rule : /aws/*
---
sent_bytes:digit = take(sent_bytes) ;
target_status_code:digit = take(target_status_code) ;
elb_status_code:digit = take(elb_status_code) ;
extends : obj = object {
    ssl_cipher = read(ssl_cipher);
    ssl_protocol = read(ssl_protocol);
};
match_chars = match read(option:[wp_src_ip]) {
    ip(127.0.0.1) => chars(localhost); 
    !ip(127.0.0.1) => chars(attack_ip); 
};
str_elb_status = match read(option:[elb_status_code]) {
    digit(200) => chars(ok);
    digit(404) => chars(error); 
};
* : auto = read();
```

###### output

``` bash
{
	"timestamp": "2018-11-30T22:23:00.186641Z",
	"actions_executed": "forward",
	"chosen_cert_arn": "arn:aws:acm:us:123:cert/short",
	"classification": "cls",
	"classification_reason": "rsn",
	"client_host": "192.168.1.10:2000",
	"domain_name": "api.example.com",
	"elb": "app/my-lb",
	"elb_status_code": 200,
	"error_reason": "err",
	"extends": {
		"ssl_cipher": "ECDHE",
		"ssl_protocol": "TLSv1.3"
	},
	"host": "127.0.0.1",
	"match_chars": "localhost",
	"matched_rule_priority": "1",
	"received_bytes": "100",
	"redirect_url": "https://auth.example.com/r",
	"request_creation_time": "2018-11-30T22:22:48.364000Z",
	"request_method": "POST",
	"request_processing_time": "0.01",
	"request_protocol": "HTTP/1.1",
	"request_url": "https://api.example.com/u?p=1&sid=2&t=3",
	"response_processing_time": "0.01",
	"sent_bytes": 200,
	"source_type": "socket",
	"ssl_cipher": "ECDHE",
	"ssl_protocol": "TLSv1.3",
	"str_elb_status": "ok",
	"target_group_arn": "arn:aws:elb:us:123:tg",
	"target_host": "10.0.0.15:8080",
	"target_port_list": "10.0.0.1:80",
	"target_processing_time": "0.02",
	"target_status_code": 200,
	"target_status_code_list": "200",
	"trace_id": "Root=1-test",
	"traceability_id": "TID_x1",
	"user_agent": "Mozilla/5.0 (Win) Chrome/90"
}
```

##### Vector

###### VRL

``` toml
source = '''
  parsed = parse_regex!(.message, r'^(?P<type>\S+) (?P<timestamp>\S+) (?P<elb>\S+) (?P<client_host>\S+) (?P<target_host>\S+) (?P<request_processing_time>[-\d\.]+) (?P<target_processing_time>[-\d\.]+) (?P<response_processing_time>[-\d\.]+) (?P<elb_status_code>\S+) (?P<target_status_code>\S+) (?P<received_bytes>\d+) (?P<sent_bytes>\d+) "(?P<request_method>\S+) (?P<request_url>[^ ]+) (?P<request_protocol>[^"]+)" "(?P<user_agent>[^"]*)" "(?P<ssl_cipher>[^"]*)" "(?P<ssl_protocol>[^"]*)" (?P<target_group_arn>\S+) "(?P<trace_id>[^"]*)" "(?P<domain_name>[^"]*)" "(?P<chosen_cert_arn>[^"]*)" (?P<matched_rule_priority>\S+) (?P<request_creation_time>\S+) "(?P<actions_executed>[^"]*)" "(?P<redirect_url>[^"]*)" "(?P<error_reason>[^"]*)" "(?P<target_port_list>[^"]*)" "(?P<target_status_code_list>[^"]*)" "(?P<classification>[^"]*)" "(?P<classification_reason>[^"]*)" (?P<traceability_id>\S+)$')
  .timestamp = parsed.timestamp
  .symbol = parsed.type
  .elb = parsed.elb
  .client_host = parsed.client_host
  .target_host = parsed.target_host
  .request_processing_time = parsed.request_processing_time
  .target_processing_time = parsed.target_processing_time
  .response_processing_time = parsed.response_processing_time
  .received_bytes = parsed.received_bytes
  .request_method = parsed.request_method
  .request_url = parsed.request_url
  .request_protocol = parsed.request_protocol
  .user_agent = parsed.user_agent
  .ssl_cipher = parsed.ssl_cipher
  .ssl_protocol = parsed.ssl_protocol
  .target_group_arn = parsed.target_group_arn
  .trace_id = parsed.trace_id
  .domain_name = parsed.domain_name
  .chosen_cert_arn = parsed.chosen_cert_arn
  .matched_rule_priority = parsed.matched_rule_priority
  .request_creation_time = parsed.request_creation_time
  .actions_executed = parsed.actions_executed
  .redirect_url = parsed.redirect_url
  .error_reason = parsed.error_reason
  .target_port_list = parsed.target_port_list
  .target_status_code_list = parsed.target_status_code_list
  .classification = parsed.classification
  .classification_reason = parsed.classification_reason
  .traceability_id = parsed.traceability_id
  del(.message)
  .elb_status_code = to_int!(parsed.elb_status_code)
  .target_status_code = to_int!(parsed.target_status_code)
  .sent_bytes = to_int!(parsed.sent_bytes)
if .host == "127.0.0.1" {
    .match_chars = "localhost"
} else if .host != "127.0.0.1" {
    .match_chars = "attack_ip"
}   
if .elb_status_code == 200 {
    .str_elb_status = "ok"
} else if .elb_status_code == 404 {
    .str__elb_status = "error"
}
  .extends = {
    "ssl_cipher": .ssl_cipher,
    "ssl_protocol": .ssl_protocol,
}
'''
```

###### output

``` bash
{
	"actions_executed": "forward",
	"chosen_cert_arn": "arn:aws:acm:us:123:cert/short",
	"classification": "cls",
	"classification_reason": "rsn",
	"client_host": "192.168.1.10:2000",
	"domain_name": "api.example.com",
	"elb": "app/my-lb",
	"elb_status_code": 200,
	"error_reason": "err",
	"extends": {
		"ssl_cipher": "ECDHE",
		"ssl_protocol": "TLSv1.3"
	},
	"host": "127.0.0.1",
	"match_chars": "localhost",
	"matched_rule_priority": "1",
	"port": 53995,
	"received_bytes": "100",
	"redirect_url": "https://auth.example.com/r",
	"request_creation_time": "2018-11-30T22:22:48.364000Z",
	"request_method": "POST",
	"request_processing_time": "0.01",
	"request_protocol": "HTTP/1.1",
	"request_url": "https://api.example.com/u?p=1&sid=2&t=3",
	"response_processing_time": "0.01",
	"sent_bytes": 200,
	"source_type": "socket",
	"ssl_cipher": "ECDHE",
	"ssl_protocol": "TLSv1.3",
	"str_elb_status": "ok",
	"symbol": "http",
	"target_group_arn": "arn:aws:elb:us:123:tg",
	"target_host": "10.0.0.15:8080",
	"target_port_list": "10.0.0.1:80",
	"target_processing_time": "0.02",
	"target_status_code": 200,
	"target_status_code_list": "200",
	"timestamp": "2018-11-30T22:23:00.186641Z",
	"trace_id": "Root=1-test",
	"traceability_id": "TID_x1",
	"user_agent": "Mozilla/5.0 (Win) Chrome/90"
}
```

| 引擎 | 拓扑 | EPS | MPS | CPU (avg/peak) | MEM (avg/peak) | 规则大小 |
| --- | --- | --- | --- | --- | --- | --- |
|   WarpParse   |   File -> BlackHole   |   **710,400**   | 278.45 |   **837.44 %/912.40 %**   |   **230.00 MB/252.95 MB**   |   1694      |
|   WarpParse   |   TCP -> BlackHole    |   **611,800**   | 239.80 |   **624.17 %/753.00 %**   |   **478.25 MB/487.42 MB**   |              |
|   WarpParse   |   TCP -> File         |   **318,200**   | 124.72 |   **593.16 %/732.60 %**   |   **409.21 MB/547.50 MB**   |              |
|   Vector      |   File -> BlackHole   |   **129,743**   | 50.85 |   **593.45 %/665.00 %**   |   **283.67 MB/298.16 MB**   |   2650       |
|   Vector      |   TCP -> BlackHole    |   **152,900**   | 59.93 |   **611.53 %/677.50 %**   |   **288.53 MB/294.42 MB**   |              |
|   Vector      |   TCP -> File         |   **582,00**   | 22.81 |   **331.78 %/373.90 %**   |   **276.99 MB/288.42 MB**   |              |

#### Sysmon（1K,JSON)

WarpParse
###### WPL

```bash
package /sysmon/ {
   rule sysmon {
        (_:pri<<,>>,3*_,_),(_\S\y\s\m\o\n\:,
        json(
            @Id:id,
            @Description/ProcessId:process_id,
            @Level:severity,
            @Opcode:Opcode,
            @ProcessId:ProcessId,
            @Task:Task,
            @ThreadId:ThreadId
            @Version:Version,
            @Description/CommandLine:cmd_line,
            @Description/ParentCommandLine:parent_cmd_line,
            @Description/LogonGuid:logon_guid,
            @Description/LogonId:logon_id,
            @Description/Image:process_path,
            @Description/ParentImage:parent_process_path,
            @Description/ParentProcessGuid:parent_process_guid,
            @Description/ParentProcessId:parent_process_id,
            @Description/ParentUser:parent_process_user,
            @Description/ProcessGuid:process_guid,
            @Description/Company:product_company,
            @Description/Description:process_desc,
            @Description/FileVersion:file_version,
            chars@Description/Hashes:Hashes
            @Description/IntegrityLevel:integrity_level,
            @Description/OriginalFileName:origin_file_name,
            @Description/Product:product_name,
            @Description/RuleName:rule_name,
            @Description/User:user_name,
            chars@Description/UtcTime:occur_time,
            @Description/TerminalSessionId:terminal_session_id,
            @Description/CurrentDirectory:current_dir,
            @Keywords:keywords
            )
        )
    }
   }
```

###### OML

``` bash
name : sysmon
rule : /sysmon/*
---
Id:digit = take(id) ;
LogonId:digit = take(logon_id) ;
enrich_level = match read(option:[severity]) {
    chars(4) => chars(severity);
    chars(3) => chars(normal);
};
extends : obj = object {
    OriginalFileName = read(origin_file_name);
    ParentCommandLine = read(parent_cmd_line);
};
extends_dir = object {
    ParentProcessPath = read(parent_process_path);
    Process_path = read(process_path);
};
match_chars = match read(option:[wp_src_ip]) {
    ip(127.0.0.1) => chars(localhost); 
    !ip(127.0.0.1) => chars(attack_ip); 
};
num_range = match read(option:[Id]) {
    in ( digit(0), digit(1000) ) => read(Id) ;
    _ => digit(0) ;
};
* : auto = read();
```

###### output

``` bash
{
	"Id": 1,
	"LogonId": 1,
	"enrich_level": "severity",
	"extends": {
		"OriginalFileName": "a.exe",
		"ParentCommandLine": "b.exe"
	},
	"extends_dir": {
		"ParentProcessPath": "C:\\\\Windows\\\\b.exe",
		"Process_path": "C:\\\\Windows\\\\a.exe"
	},
	"match_chars": "localhost",
	"num_range": 1,
	"wp_event_id": 1764813339134818000,
	"cmd_line": "a.exe",
	"product_company": "C",
	"current_dir": "C:\\\\",
	"process_desc": "D",
	"file_version": "1",
	"Hashes": "H",
	"process_path": "C:\\\\Windows\\\\a.exe",
	"integrity_level": "M",
	"logon_guid": "{LG}",
	"origin_file_name": "a.exe",
	"parent_cmd_line": "b.exe",
	"parent_process_path": "C:\\\\Windows\\\\b.exe",
	"parent_process_guid": "{PG}",
	"parent_process_id": "1",
	"parent_process_user": "U",
	"process_guid": "{G}",
	"process_id": "1",
	"product_name": "P",
	"rule_name": "R",
	"terminal_session_id": "1",
	"user_name": "U",
	"occur_time": "2025-04-10 06:17:28.503",
	"DescriptionRawMessage": "Process Create\\r\\nRuleName: R",
	"keywords": "0",
	"severity": "4",
	"LevelDisplayName": "信息",
	"LogName": "L",
	"MachineName": "A",
	"Opcode": "0",
	"OpcodeDisplayName": "信息",
	"ProcessId": "1",
	"ProviderId": "PID",
	"ProviderName": "P",
	"Task": "1",
	"TaskDisplayName": "Process Create",
	"ThreadId": "1",
	"TimeCreated": "2025-04-10T14:17:28.693228+08:00",
	"Version": "1",
	"wp_src_key": "socket",
	"wp_src_ip": "127.0.0.1"
}
```

##### Vector

###### VRL

``` toml
source = '''
  parsed_msg = parse_regex!(.message, r'^[^{]*(?P<body>\{.*)$')
  parsed = parse_regex!(parsed_msg.body, r'(?s)\{"Id":(?P<Id>[^,]+),"Version":(?P<Version>[^,]+),"Level":(?P<Level>[^,]+),"Task":(?P<Task>[^,]+),"Opcode":(?P<Opcode>[^,]+),"Keywords":(?P<Keywords>[^,]+),"RecordId":(?P<RecordId>[^,]+),"ProviderName":"(?P<ProviderName>[^"]*)","ProviderId":"(?P<ProviderId>[^"]*)","LogName":"(?P<LogName>[^"]*)","ProcessId":(?P<ProcessId>[^,]+),"ThreadId":(?P<ThreadId>[^,]+),"MachineName":"(?P<MachineName>[^"]*)","TimeCreated":"(?P<TimeCreated>[^"]*)","ActivityId":(?P<ActivityId>[^,]+),"RelatedActivityId":(?P<RelatedActivityId>[^,]+),"Qualifiers":(?P<Qualifiers>[^,]+),"LevelDisplayName":"(?P<LevelDisplayName>[^"]*)","OpcodeDisplayName":"(?P<OpcodeDisplayName>[^"]*)","TaskDisplayName":"(?P<TaskDisplayName>[^"]*)","Description":\{"RuleName":"(?P<RuleName>[^"]*)","UtcTime":"(?P<UtcTime>[^"]*)","ProcessGuid":"(?P<ProcessGuid>[^"]*)","ProcessId":"(?P<DescProcessId>[^"]*)","Image":"(?P<Image>[^"]*)","FileVersion":"(?P<FileVersion>[^"]*)","Description":"(?P<Description>[^"]*)","Product":"(?P<Product>[^"]*)","Company":"(?P<Company>[^"]*)","OriginalFileName":"(?P<OriginalFileName>[^"]*)","CommandLine":"(?P<CommandLine>[^"]*)","CurrentDirectory":"(?P<CurrentDirectory>[^"]*)","User":"(?P<User>[^"]*)","LogonGuid":"(?P<LogonGuid>[^"]*)","LogonId":"(?P<LogonId>[^"]*)","TerminalSessionId":"(?P<TerminalSessionId>[^"]*)","IntegrityLevel":"(?P<IntegrityLevel>[^"]*)","Hashes":"(?P<Hashes>[^"]*)","ParentProcessGuid":"(?P<ParentProcessGuid>[^"]*)","ParentProcessId":"(?P<ParentProcessId>[^"]*)","ParentImage":"(?P<ParentImage>[^"]*)","ParentCommandLine":"(?P<ParentCommandLine>[^"]*)","ParentUser":"(?P<ParentUser>[^"]*)"\},"DescriptionRawMessage":"(?P<DescriptionRawMessage>[^"]*)"\}$')
  .cmd_line = parsed.CommandLine
  .product_company= parsed.Company
  .Opcode = parsed.Opcode
  .process_id = parsed.ProcessId 
  .ProcessId = parsed.ProcessId 
  .Task = parsed.Task
  .ThreadId = parsed.ThreadId
  .Version = parsed.Version
  .current_dir = parsed.CurrentDirectory
  .process_desc = parsed.Description
  .file_version = parsed.FileVersion
  .Hashes = parsed.Hashes
  .process_path = parsed.Image
  .integrity_level = parsed.IntegrityLevel
  .logon_guid = parsed.LogonGuid
  .origin_file_name = parsed.OriginalFileName
  .parent_cmd_line = parsed.ParentCommandLine
  .parent_process_path = parsed.ParentImage
  .parent_process_guid = parsed.ParentProcessGuid
  .parent_process_id = parsed.ParentProcessId
  .parent_process_user = parsed.ParentUser
  .process_guid = parsed.ProcessGuid
  .product_name = parsed.Product
  .rule_name = parsed.RuleName
  .terminal_session_id = parsed.TerminalSessionId
  .user_name = parsed.User
  .occur_time = parsed.UtcTime
  .DescriptionRawMessage = parsed.DescriptionRawMessage
  .keywords = parsed.Keywords
  .severity = parsed.Level
  .LevelDisplayName = parsed.LevelDisplayName
  .LogName = parsed.LogName
  .MachineName = parsed.MachineName
  .OpcodeDisplayName = parsed.OpcodeDisplayName
  .ProviderId = parsed.ProviderId
  .ProviderName = parsed.ProviderName
  .TaskDisplayName = parsed.TaskDisplayName
  .TimeCreated = parsed.TimeCreated
  del(.message)
  .LogonId = to_int!(parsed.LogonId)
  .Id = to_int!(parsed.Id)
if .host == "127.0.0.1" {
    .match_chars = "localhost"
} else if .host != "127.0.0.1" {
    .match_chars = "attack_ip"
}   
if .severity == "4" {
    .enrich_level = "severity"
} else if .Level == "3" {
    .enrich_level = "normal"
} 
.extends = {
    "OriginalFileName": .origin_file_name,
    "ParentCommandLine": .parent_cmd_line,
}
.extends_dir = {
    "ParentProcessPath": .parent_process_path,
    "Process_path": .process_path,
}
.num_range = if .Id >= 0 && .Id <= 1000 {
    .Id
} else {
    0
}
'''
```

###### output

``` bash
{
	"DescriptionRawMessage": "Process Create\\r\\nRuleName: R",
	"Hashes": "H",
	"Id": 1,
	"LevelDisplayName": "信息",
	"LogName": "L",
	"LogonId": 1,
	"MachineName": "A",
	"Opcode": "0",
	"OpcodeDisplayName": "信息",
	"ProcessId": "1",
	"ProviderId": "PID",
	"ProviderName": "P",
	"Task": "1",
	"TaskDisplayName": "Process Create",
	"ThreadId": "1",
	"TimeCreated": "2025-04-10T14:17:28.693228+08:00",
	"Version": "1",
	"cmd_line": "a.exe",
	"current_dir": "C:\\\\",
	"enrich_level": "severity",
	"extends": {
		"OriginalFileName": "a.exe",
		"ParentCommandLine": "b.exe"
	},
	"extends_dir": {
		"ParentProcessPath": "C:\\\\Windows\\\\b.exe",
		"Process_path": "C:\\\\Windows\\\\a.exe"
	},
	"file_version": "1",
	"host": "127.0.0.1",
	"integrity_level": "M",
	"keywords": "0",
	"logon_guid": "{LG}",
	"match_chars": "localhost",
	"num_range": 1,
	"occur_time": "2025-04-10 06:17:28.503",
	"origin_file_name": "a.exe",
	"parent_cmd_line": "b.exe",
	"parent_process_guid": "{PG}",
	"parent_process_id": "1",
	"parent_process_path": "C:\\\\Windows\\\\b.exe",
	"parent_process_user": "U",
	"port": 49838,
	"process_desc": "D",
	"process_guid": "{G}",
	"process_id": "1",
	"process_path": "C:\\\\Windows\\\\a.exe",
	"product_company": "C",
	"product_name": "P",
	"rule_name": "R",
	"severity": "4",
	"source_type": "socket",
	"terminal_session_id": "1",
	"timestamp": "2025-12-04T02:04:24.686378Z",
	"user_name": "U"
}
```

| 引擎 | 拓扑 | EPS | MPS | CPU (avg/peak) | MEM (avg/peak) | 规则大小 |
| --- | --- | --- | --- | --- | --- | --- |
|   WarpParse   |   File -> BlackHole   |   **354,800**   | 333.63 |   **880.24 %/935.40 %**   |   **157.88 MB/170.69 MB**   |   2249       |
|   WarpParse   |   TCP -> BlackHole    |   **299,500**   | 281.63 |   **664.56 %/749.00 %**   |   **367.47 MB/377.25 MB**   |              |
|   WarpParse   |   TCP -> File         |   **219,900**   | 206.78 |   **719.29 %/817.00 %**   |   **431.93 MB/457.17 MB**   |              |
|   Vector      |   File -> BlackHole   |   **582,00**   | 54.73 |   **431.45 %/527.60 %**   |   **296.28 MB/317.84 MB**   |   3782       |
|   Vector      |   TCP -> BlackHole    |   **97,200**   | 91.40 |   **710.83 %/806.80 %**   |   **399.64 MB/424.08 MB**   |              |
|   Vector      |   TCP -> File         |   **40,300**   | 37.90 |   **391.09 %/497.30 %**   |   **394.67 MB/409.95 MB**   |              |

#### APT（3K)

WarpParse
###### WPL

```bash
package /apt/ {
   rule apt {
        (
            _\#,
            time:timestamp,
            _,
            chars:Hostname,
            _\%\%, 
            chars:ModuleName\/,
            chars:SeverityHeader\/,
            symbol(ANTI-APT)\(,
            chars:type\),
            chars:Count<[,]>,
            _\:,
            chars:Content\(,
        ),
        (
            kv(chars@SyslogId),
            kv(chars@VSys),
            kv(chars@Policy),
            kv(chars@SrcIp),
            kv(chars@DstIp),
            kv(chars@SrcPort),
            kv(chars@DstPort),
            kv(chars@SrcZone),
            kv(chars@DstZone),
            kv(chars@User),
            kv(chars@Protocol),
            kv(chars@Application),
            kv(chars@Profile),
            kv(chars@Direction),
            kv(chars@ThreatType),
            kv(chars@ThreatName),
            kv(chars@Action),
            kv(chars@FileType),
            kv(chars@Hash)\),
        )\,
    }
   }
```

###### OML

``` bash
name : apt
rule : /apt/*
---
count:digit = take(Count) ;
severity:digit = take(SeverityHeader) ;
match_chars = match read(option:[wp_src_ip]) {
    ip(127.0.0.1) => chars(localhost); 
    !ip(127.0.0.1) => chars(attack_ip); 
};
num_range = match read(option:[count]) {
    in ( digit(0), digit(1000) ) => read(count) ;
    _ => digit(0) ;
};
src_system_log_type = match read(option:[type]) {
    chars(l) => chars(日志信息);
    chars(s) => chars(安全日志信息);
};
extends_ip : obj = object {
    DstIp = read(DstIp);
    SrcIp = read(SrcIp);
};
extends_info : obj = object {
    hostname = read(Hostname);
    source_type = read(wp_src_key)
};
* : auto = read();
```

###### output

``` bash
{
	"count": 29,
	"severity": 4,
	"match_chars": "localhost",
	"num_range": 29,
	"src_system_log_type": "日志信息",
	"extends_ip": {
		"DstIp": "182.150.63.102",
		"SrcIp": "192.168.1.123"
	},
	"extends_info": {
		"hostname": "USG1000E",
		"source_type": "socket"
	},
	"wp_event_id": 1764815397395451000,
	"timestamp": "2025-02-07 15:07:18",
	"Hostname": "USG1000E",
	"ModuleName": "01ANTI-APT",
	"symbol": "ANTI-APT",
	"type": "l",
	"Content": "An advanced persistent threat was detected.",
	"SyslogId": "1",
	"VSys": "public-long-virtual-system-name-for-testing-extra-large-value-to-simulate-enterprise-scenario",
	"Policy": "trust-untrust-high-risk-policy-with-deep-inspection-and-layer7-protection-enabled-for-advanced-threat-detection",
	"SrcIp": "192.168.1.123",
	"DstIp": "182.150.63.102",
	"SrcPort": "51784",
	"DstPort": "10781",
	"SrcZone": "trust-zone-with-multiple-segments-for-internal-security-domains-and-access-control",
	"DstZone": "untrust-wide-area-network-zone-with-external-facing-interfaces-and-honeynet-integration",
	"User": "unknown-long-user-field-used-for-simulation-purpose-with-extra-description-and-tags-[tag1][tag2][tag3]-to-reach-required-size",
	"Protocol": "TCP",
	"Application": "HTTP-long-application-signature-identification-with-multiple-behavior-patterns-and-deep-packet-inspection-enabled",
	"Profile": "IPS_default_advanced_extended_profile_with_ml_detection-long",
	"Direction": "aaa-long-direction-field-used-to-extend-size-with-additional-info-about-traffic-orientation-from-client-to-server",
	"ThreatType": "File Reputation with additional descriptive context of multi-layer analysis engine including sandbox-behavioral-signature-ml-static-analysis-and-network-correlation-modules-working-together",
	"ThreatName": "bbb-advanced-threat-campaign-with-code-name-operation-shadow-storm-and-related-IOCs-collected-over-multiple-incidents-in-the-wild-attached-metadata-[phase1][phase2][phase3]",
	"Action": "ccc-block-and-alert-with-deep-scan-followed-by-quarantine-and-forensic-dump-generation-for-further-investigation",
	"FileType": "ddd-executable-binary-with-multiple-packed-layers-suspicious-import-table-behavior-and-evasion-techniques",
	"Hash": "eee1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef-long-hash-value-used-for-testing-purpose-extended-with-multiple-hash-representations-[MD5:aaa111bbb222ccc333]-[SHA1:bbb222ccc333ddd444]-[SHA256:ccc333ddd444eee555]-[SSDEEP:ddd444eee555fff666]-end-of-hash-section, ExtraInfo=\"This is additional extended information purposely added to inflate the total log size for stress testing of log ingestion engines such as Vector, Fluent Bit, self-developed ETL pipelines, and any high-throughput log processing systems. It contains repeated segments to simulate realistic verbose threat intelligence attachment blocks. [SEG-A-BEGIN] The threat was part of a coordinated multi-vector campaign observed across various geographic regions targeting enterprise networks with spear-phishing, watering-hole attacks, and supply-chain compromise vectors. Enriched indicators include C2 domains, malware families, behavioral clusters, sandbox detonation traces, and network telemetry correlation. [SEG-A-END] [SEG-B-BEGIN] Further analysis revealed that the payload exhibited persistence techniques including registry autoruns, scheduled tasks, masquerading, process injection, and lateral movement attempts leveraging remote service creation and stolen credentials. The binary contains multiple obfuscation layers, anti-debugging, anti-VM checks, and unusual API call sequences. [SEG-B-END] [SEG-C-BEGIN] IOC Bundle: Domains=malicious-domain-example-01.com,malicious-domain-example-02.net,malicious-update-service.info; IPs=103.21.244.0,198.51.100.55,203.0.113.77; FileNames=update_service.exe,winlog_service.dll,mscore_update.bin; RegistryKeys=HKCU\\\\Software\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Run,HKLM\\\\System\\\\Services\\\\FakeService; Mutex=Global\\\\A1B2C3D4E5F6G7H8; YARA Matches=[rule1,rule2,rule3]. [SEG-C-END] EndOfExtraInfo\"",
	"wp_src_key": "socket",
	"wp_src_ip": "127.0.0.1"
}
```

##### Vector

``` toml
source = '''
parsed_log = parse_regex!(.message, r'(?s)^#(?P<timestamp>\w+\s+\d+\s+\d{4}\s+\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2})\s+(?P<hostname>\S+)\s+%%(?P<ModuleName>\d+[^/]+)/(?P<SeverityHeader>\d+)/(?P<symbol>[^(]+)\((?P<type>[^)]+)\)\[(?P<count>\d+)\]:\s*(?P<content>[^()]+?)\s*\(SyslogId=(?P<SyslogId>[^,]+),\s+VSys="(?P<VSys>[^"]+)",\s+Policy="(?P<Policy>[^"]+)",\s+SrcIp=(?P<SrcIp>[^,]+),\s+DstIp=(?P<DstIp>[^,]+),\s+SrcPort=(?P<SrcPort>[^,]+),\s+DstPort=(?P<DstPort>[^,]+),\s+SrcZone=(?P<SrcZone>[^,]+),\s+DstZone=(?P<DstZone>[^,]+),\s+User="(?P<User>[^"]+)",\s+Protocol=(?P<Protocol>[^,]+),\s+Application="(?P<Application>[^"]+)",\s+Profile="(?P<Profile>[^"]+)",\s+Direction=(?P<Direction>[^,]+),\s+ThreatType=(?P<ThreatType>[^,]+),\s+ThreatName=(?P<ThreatName>[^,]+),\s+Action=(?P<Action>[^,]+),\s+FileType=(?P<FileType>[^,]+),\s+Hash=(?P<Hash>.*)\)$')
  .Hostname = parsed_log.hostname
  .SrcPort = parsed_log.SrcPort
  .SeverityHeader = parsed_log.SeverityHeader
  .type = parsed_log.type
  .Content = parsed_log.content
  .VSys = parsed_log.VSys
  .DstPort = parsed_log.DstPort
  .Policy = parsed_log.Policy
  .SrcIp = parsed_log.SrcIp
  .DstIp = parsed_log.DstIp
  .SrcZone = parsed_log.SrcZone
  .DstZone = parsed_log.DstZone
  .User = parsed_log.User
  .Protocol = parsed_log.Protocol
  .ModuleName = parsed_log.ModuleName
  .symbol = parsed_log.symbol
  .timestamp = parsed_log.timestamp
  .SyslogId = parsed_log.SyslogId
  .Application = parsed_log.Application
  .Profile = parsed_log.Profile
  .Direction = parsed_log.Direction
  .ThreatType = parsed_log.ThreatType
  .ThreatName = parsed_log.ThreatName
  .Action = parsed_log.Action
  .FileType = parsed_log.FileType
  .Hash = parsed_log.Hash
  del(.message)
.severity = to_int!(parsed_log.SeverityHeader)
.count = to_int!(parsed_log.count)
if .host == "127.0.0.1" {
    .match_chars = "localhost"
} else if .host != "127.0.0.1" {
    .match_chars = "attack_ip"
}  
if .type == "l" {
.src_system_log_type = "日志信息"
} else if .type == "s" {
.src_system_log_type = "安全日志信息"
}
.extends_ip = {
    "DstIp": .DstIp,
    "SrcIp": .SrcIp,
}
.extends_info = {
    "hostname": .Hostname,
    "source_type": .source_type,
}
.num_range = if .count >= 0 && .count <= 1000 {
    .count
} else {
    0
}
'''
```

###### output

``` bash
{
	"Action": "ccc-block-and-alert-with-deep-scan-followed-by-quarantine-and-forensic-dump-generation-for-further-investigation",
	"Application": "HTTP-long-application-signature-identification-with-multiple-behavior-patterns-and-deep-packet-inspection-enabled",
	"Content": "An advanced persistent threat was detected.",
	"Direction": "aaa-long-direction-field-used-to-extend-size-with-additional-info-about-traffic-orientation-from-client-to-server",
	"DstIp": "182.150.63.102",
	"DstPort": "10781",
	"DstZone": "untrust-wide-area-network-zone-with-external-facing-interfaces-and-honeynet-integration",
	"FileType": "ddd-executable-binary-with-multiple-packed-layers-suspicious-import-table-behavior-and-evasion-techniques",
	"Hash": "eee1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef-long-hash-value-used-for-testing-purpose-extended-with-multiple-hash-representations-[MD5:aaa111bbb222ccc333]-[SHA1:bbb222ccc333ddd444]-[SHA256:ccc333ddd444eee555]-[SSDEEP:ddd444eee555fff666]-end-of-hash-section, ExtraInfo=\"This is additional extended information purposely added to inflate the total log size for stress testing of log ingestion engines such as Vector, Fluent Bit, self-developed ETL pipelines, and any high-throughput log processing systems. It contains repeated segments to simulate realistic verbose threat intelligence attachment blocks. [SEG-A-BEGIN] The threat was part of a coordinated multi-vector campaign observed across various geographic regions targeting enterprise networks with spear-phishing, watering-hole attacks, and supply-chain compromise vectors. Enriched indicators include C2 domains, malware families, behavioral clusters, sandbox detonation traces, and network telemetry correlation. [SEG-A-END] [SEG-B-BEGIN] Further analysis revealed that the payload exhibited persistence techniques including registry autoruns, scheduled tasks, masquerading, process injection, and lateral movement attempts leveraging remote service creation and stolen credentials. The binary contains multiple obfuscation layers, anti-debugging, anti-VM checks, and unusual API call sequences. [SEG-B-END] [SEG-C-BEGIN] IOC Bundle: Domains=malicious-domain-example-01.com,malicious-domain-example-02.net,malicious-update-service.info; IPs=103.21.244.0,198.51.100.55,203.0.113.77; FileNames=update_service.exe,winlog_service.dll,mscore_update.bin; RegistryKeys=HKCU\\\\Software\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Run,HKLM\\\\System\\\\Services\\\\FakeService; Mutex=Global\\\\A1B2C3D4E5F6G7H8; YARA Matches=[rule1,rule2,rule3]. [SEG-C-END] EndOfExtraInfo\"",
	"Hostname": "USG1000E",
	"ModuleName": "01ANTI-APT",
	"Policy": "trust-untrust-high-risk-policy-with-deep-inspection-and-layer7-protection-enabled-for-advanced-threat-detection",
	"Profile": "IPS_default_advanced_extended_profile_with_ml_detection-long",
	"Protocol": "TCP",
	"SeverityHeader": "4",
	"SrcIp": "192.168.1.123",
	"SrcPort": "51784",
	"SrcZone": "trust-zone-with-multiple-segments-for-internal-security-domains-and-access-control",
	"SyslogId": "1",
	"ThreatName": "bbb-advanced-threat-campaign-with-code-name-operation-shadow-storm-and-related-IOCs-collected-over-multiple-incidents-in-the-wild-attached-metadata-[phase1][phase2][phase3]",
	"ThreatType": "File Reputation with additional descriptive context of multi-layer analysis engine including sandbox-behavioral-signature-ml-static-analysis-and-network-correlation-modules-working-together",
	"User": "unknown-long-user-field-used-for-simulation-purpose-with-extra-description-and-tags-[tag1][tag2][tag3]-to-reach-required-size",
	"VSys": "public-long-virtual-system-name-for-testing-extra-large-value-to-simulate-enterprise-scenario",
	"count": 29,
	"extends_info": {
		"hostname": "USG1000E",
		"source_type": "socket"
	},
	"extends_ip": {
		"DstIp": "182.150.63.102",
		"SrcIp": "192.168.1.123"
	},
	"host": "127.0.0.1",
	"match_chars": "localhost",
	"num_range": 29,
	"port": 51272,
	"severity": 4,
	"source_type": "socket",
	"src_system_log_type": "日志信息",
	"symbol": "ANTI-APT",
	"timestamp": "Feb  7 2025 15:07:18+08:00",
	"type": "l"
}
```

| 引擎 | 拓扑 | EPS | MPS | CPU (avg/peak) | MEM (avg/peak) | 规则大小 |
| --- | --- | --- | --- | --- | --- | --- |
|   WarpParse   |   File -> BlackHole   |   **280,000**   | 947.15 |   **768.50 %/868.90 %**   |   **172.72 MB/178.23 MB**   |   1638       |
|   WarpParse   |   TCP -> BlackHole    |   **238,900**   | 808.12 |   **657.14 %/705.40 %**   |   **364.73 MB/389.94 MB**   |              |
|   WarpParse   |   TCP -> File         |   **169,800**   | 574.38 |   **663.90 %/883.80 %**   |   **871.77 MB/1500.22 MB**   |              |
|   Vector      |   File -> BlackHole   |   **306,12**   | 103.55 |   **560.94 %/654.40 %**   |   **248.00 MB/273.02 MB**   |   2259       |
|   Vector      |   TCP -> BlackHole    |   **340,00**   | 115.01 |   **693.47 %/848.80 %**   |   **408.92 MB/430.59 MB**   |              |
|   Vector      |   TCP -> File         |   **249,00**   | 84.23 |   **538.78 %/644.90 %**   |   **393.26 MB/420.05 MB**   |              |

### Linux VPS
平台数据仍在采集中，先保留统一表格，便于后续补录。

#### Nginx（239B）

| 引擎      | 拓扑                | EPS | MPS | CPU (avg/peak) | MEM (avg/peak) | 规则大小 |
| --------- | ------------------- | --- | --- | -------------- | -------------- | -------- |
| WarpParse | File -> BlackHole   | -   | -   | -              | -              | -        |
|           | TCP -> BlackHole    | -   | -   | -              | -              |          |
|           | TCP -> File         | -   | -   | -              | -              |          |
| Vector    | File -> BlackHole   | -   | -   | -              | -              | -        |
|           | TCP -> BlackHole    | -   | -   | -              | -              |          |
|           | TCP -> File         | -   | -   | -              | -              |          |

#### AWS（411B)

| 引擎      | 拓扑                | EPS | MPS | CPU (avg/peak) | MEM (avg/peak) | 规则大小 |
| --------- | ------------------- | --- | --- | -------------- | -------------- | -------- |
| WarpParse | File -> BlackHole   | -   | -   | -              | -              | -        |
|           | TCP -> BlackHole    | -   | -   | -              | -              |          |
|           | TCP -> File         | -   | -   | -              | -              |          |
| Vector    | File -> BlackHole   | -   | -   | -              | -              | -        |
|           | TCP -> BlackHole    | -   | -   | -              | -              |          |
|           | TCP -> File         | -   | -   | -              | -              |          |

#### Sysmon（1K,JSON)

| 引擎      | 拓扑                | EPS | MPS | CPU (avg/peak) | MEM (avg/peak) | 规则大小 |
| --------- | ------------------- | --- | --- | -------------- | -------------- | -------- |
| WarpParse | File -> BlackHole   | -   | -   | -              | -              | -        |
|           | TCP -> BlackHole    | -   | -   | -              | -              |          |
|           | TCP -> File         | -   | -   | -              | -              |          |
| Vector    | File -> BlackHole   | -   | -   | -              | -              | -        |
|           | TCP -> BlackHole    | -   | -   | -              | -              |          |
|           | TCP -> File         | -   | -   | -              | -              |          |

#### APT（3K)

| 引擎      | 拓扑              | EPS | MPS | CPU (avg/peak) | MEM (avg/peak) | 规则大小 |
| --------- | ----------------- | --- | --- | -------------- | -------------- | -------- |
| WarpParse | File -> BlackHole | -   | -   | -              | -              | -        |
|           | TCP -> BlackHole  | -   | -   | -              | -              |          |
|           | TCP -> File       | -   | -   | -              | -              |          |
| Vector    | File -> BlackHole | -   | -   | -              | -              | -        |
|           | TCP -> BlackHole  | -   | -   | -              | -              |          |
|           | TCP -> File       | -   | -   | -              | -              |          |
