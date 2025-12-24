# 规则字典

## 基础

| 字符           | 描述             | 示例                                           | 语法                | 结果                                                         |
| -------------- | ---------------- | ---------------------------------------------- | ------------------- | ------------------------------------------------------------ |
| chars          | 匹配字符串       | xxxxxxxxxxxxx                                  | (chars)             | NO:1          [chars        ] auto              : xxxxxxxxxxxxx |
| symbol         |                  |                                                | (symbol(color=red)) |                                                              |
| ip             | 匹配ip           | 222.133.52.20                                  | (ip)                | NO:1          [ip              ] ip                   : 222.133.52.20 |
| ip_net         | 匹配ip net       | 10.1.1.0/24                                    | (ip_net)            | NO:1          [ip_net      ] ip_net           : 10.1.1.0/24  |
| hex            | 匹配十六进制     | 0xE2                                           | (hex)               | NO:1          [hex            ] hex               : 0xE2     |
| digit          | 匹配整形         | 88                                             | (digit)             | NO:1          [digit         ] digit                : 88     |
| port           | 匹配整形端口     | 10001                                          | (port)              | NO:1          [digit         ] port                 : 10001  |
| float          | 匹配浮点         | 222.1                                          | (float)             | NO:1          [float         ] float                : 222.1  |
| time           | 匹配时间         | 2022-10-11 17:17:13                            | (time)              | NO:1          [time         ] time                : 2022-10-11 17:17:13 |
| time_iso       | 匹配ISO时间      | 2023-04-13T15:30:00Z                           | (time_iso)          | NO:1          [time         ] time_iso         : 2023-04-13 15:30:00 |
| time_3339      | 匹配3339时间     | 2023-04-13T08:00:00.00+08:00                   | (time_3339)         | NO:1          [time         ] time_3339     : 2023-04-13 15:30:00 |
| time_2822      | 匹配2822时间     | Thu, 13 Apr 2023 15:30:00 +0000                | (time_2822)         | NO:1          [time         ] time_2822     : 2023-04-13 15:30:00 |
| time_timestamp | 匹配时间戳       | 1678882200                                     | (time_timestamp)    | NO:1          [time         ] time_timestamp  : 2021-2-19 17:28:44 |
| ignore         | 匹配忽略字符     | 2022-2-9 20:57:57 _ _ 500                      | (time,\_,\_,digit)  | NO:1          [time          ] time               : 2022-2-9 20:57:57<br/>NO:4          [digit          ] digit                : 500 |
| http/method    | 匹配字符http方法 | GET                                            | (http/method)       | NO:1          [http/method] http/method     : GET            |
| http/agent     | 匹配字符http代理 | Mozilla/5.0(Macintosh; Intel Mac OS X 10_14_5) | (http/agent)        | NO:1          [http/agent] http/agent       : Mozilla/5.0(Macintosh; Intel Mac OS X 10_14_5) |
| http/status    | 匹配字符http状态 | 500                                            | (http/status)       | NO:1          [http/status] http/status          : 500       |
| http/request   | 匹配字符http请求 | GET /nginx-logo.png HTTP/1.1                   | (http/request)      | NO:1          [http/request] http/request     : GET /nginx-logo.png HTTP/1.1 |
| base64         | 匹配解析base64   | eHh4eHh4eHh4eHh4eHh4                           | \|base64\|(chars)   | NO:1          [chars          ] chars                    : xxxxxxxxxxxxxxx |
| kv             | 匹配map解析      | key=eHh4eHh4eHh4eHh4eHh4                       | (kv)                | NO:1          [chars          ] key                       : eHh4eHh4eHh4eHh4eHh4 |
| json           | 匹配json解析     | {"data":80}                                    | (json(digit@data))  | NO:1          [digit           ] data                 : 80   |



## 进阶

| 类型 | 功能                                                         | 示例                                              | 语法                                    | 结果                                                         |
| ---- | ------------------------------------------------------------ | ------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------ |
| json | 解析json字段, 操作@字段名，字段名需填写正确                  | {"data":80}                                       | (chars@data)                            | NO:1          [chars        ] data              : 80         |
| json | 解析json子结构字段，字段名/进行向下查询<br />字段名需填写正确 | {"data":{"two":80}}                               | (chars@data/two)                        | NO:1          [chars        ] data/two             : 80      |
| kv   | 解析map字段, 操作@字段名，字段名需填写正确                   | id=fffff, time="2022-10-11 17:17:13", sip=1.1.1.1 | (kv(chars@id),kv(time@time),kv(ip@sip)) | NO:1          [kv              ] id                   : fffff,<br/>NO:2          [kv              ] time                 : "2022-10-11 17:17:13",<br/>NO:3          [kv              ] sip                  : 1.1.1.1 |