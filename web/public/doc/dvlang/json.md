# Json 数据处理

json 是结构化日志

## 示例

```json
{"b":21,"c": "127.0.0.1","a" : "aGVsbG8="}
```

```
(json)
(json(_@b, opt(ip)@c:src-ip, base64@a))
(json(src-ip)
(json(_@*,ip@alarm_sip , json@_origin, _@_origin/*,ip@_origin/sip))
```



###  天眼探针解析

```
rule qax_tianyan {
  |base64|(
      digit<<,>>,time,sn,chars\:,time\|\!,ip\|\!,chars\|\!,
      json(_@att*,_@0x11*,_@_origin/*,json@payload,base64@payload/req_header, base64@payload/rsp_body),*_
  )
}
```

#### 规则说明

```txt
_@att*   : ignore以att开头的字段
_@_origin/*  : ignore以_origin/下所有的字段
json@payload : 对payload字段再次进行 json 解析.
base64@payload/req_header : 对 payload/req_header 字段进行 base64解码.
base64@payload/rsp_body : 对payload/rsp_body 字段进行 base64解码.
```




#### 解析结果
```bash
NO:1          [digit           ] digit                : 158
NO:2          [time            ] time                 : 2023-May-16 14:42:01
NO:3          [sn              ] sn                   : skyeye
NO:4          [chars           ] chars                : SyslogClient[1]
NO:5          [time            ] time                 : 2023-05-16 14:42:01
NO:6          [ip              ] ip                   : 10.180.8.8
NO:7          [chars           ] chars                : alarm
NO:25         [time            ] access_time          : 2023-05-16 14:35:39
NO:26         [digit           ] alarm_id             : 20230516
NO:27         [float           ] alarm_sample         : 1
NO:28         [ip              ] alarm_sip            : 10.180.8.3
NO:29         [float           ] alarm_source         : 1
NO:30         [chars           ] asset_group          : 未分配资产组
NO:36         [chars           ] branch_id            : QtAVdJgqi
NO:37         [chars           ] confidence           : 中
NO:38         [ip              ] dip                  : 10.180.8.3
NO:39         [chars           ] dip_addr             : 局域网
NO:40         [chars           ] dip_group            : 未分配资产组
NO:41         [float           ] dport                : 80
NO:42         [kv              ] 00                   : 0c:31:0b:30:80
NO:43         [digit           ] file_md5             : 8051
NO:44         [ip              ] file_name            : 10.111.9.103
NO:45         [time            ] first_access_time    : 2023-05-16 14:35:39
NO:46         [float           ] hazard_level         : 2
NO:47         [chars           ] hazard_rating        : 低危
NO:48         [ip              ] host                 : 10.180.8.3
NO:49         [digit           ] host_md5             : 75
NO:50         [chars           ] host_state           : 企图
NO:51         [digit           ] ioc                  : 268568511
NO:52         [float           ] is_delete            : 0
NO:53         [digit           ] is_web_attack        : 1
NO:54         [float           ] is_white             : 0
NO:55         [chars           ] nid                  :
NO:56         [chars           ] payload/req_body     :
NO:57         [base64          ] payload/req_header   : GET /upload/gdjcheckreport/data/2021/12/24/10.111.9.103_20211224_10.txt HTTP/1.0
Host: 10.180.8.3
User-Agent: Python-urllib/1.17


NO:58         [base64          ] payload/rsp_body     : <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>运维工作管理系统</title>
        <link href="/css/css.css" rel="stylesheet" type="text/css" />
        <link rel="stylesheet" rev="stylesheet" href="/css/style.css" type="text/css" media="all" />
        <script src="/js/jquery-1.8.0.js" type="text/javascript"></script>
        <script type="text/javascript">
            var txtNum_func=function(a){
            a=$.trim(a);
            if(typeof a=="undefined")return 0;
            var c=a.match(/[^\x00-\x80]/g);
            var num =  a.length+(!c?0:(c.length)*2)
            return Math.ceil(num/3);
            };
        </script>
        <link href="/js/common/common.css" rel="stylesheet" type="text/css" />
        <script src="/js/common/common.js"></script>
    </head>
    <body>
        <div>
            <table width="100%" style="margin-top: 150px">
    <tr>
        <td align="center">
            <div style="width:500px;height: 280px;background: url(/images/mes_er.gif);text-align: left;margin: 0px">
                <div style="padding:120px 0 0 180px;">
                    <div><font style="font-size: 60px;font-weight: bold">404</font></div>
                    <div style="line-height: 20px;color:gray;margin-top: 10px"><b>提示信息：</b><br />
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;无法解析请求 "upload/gdjcheckreport/data/2021/12/24/10.111.9.103_20211224_10.txt"。                    </div>
                </div>
            </div>

        </td>
    </tr>
</table>        </div>
    </body>
</html>
NO:59         [kv              ] SFRUUC8xLjAgNDA0IE5vdCBGb3VuZA0KRGF0ZTogVHVlLCAxNiBNYXkgMjAyMyAwNjo0MDoxMyBHTVQNClNlcnZlcjogQXBhY2hlLzIuNC41NCAoVW5peCkgUEhQLzUuNi40MA0KWC1Qb3dlcmVkLUJ5OiBQSFAvNS42LjQwDQpDb250ZW50LUxlbmd0aDogMTgyNQ0KQ29ubmVjdGlvbjogY2xvc2UNCkNvbnRlbnQtVHlwZTogdGV4dC9odG1sOyBjaGFyc2V0PVVURi04DQoNCg : =
NO:60         [chars           ] proto                : http
NO:61         [float           ] repeat_count         : 1
NO:62         [digit           ] rsp_status           : 404
NO:63         [chars           ] rule_desc            : 网页漏洞利用
NO:64         [digit           ] rule_id              : 0
NO:65         [chars           ] rule_key             : webids
NO:74         [chars           ] rule_state           : green
NO:75         [chars           ] serial_num           : QbJK/tb6A
NO:76         [ip              ] sip                  : 10.111.82.87
NO:77         [chars           ] sip_addr             : 局域网
NO:78         [chars           ] sip_group            : 未分配资产组
NO:79         [digit           ] sip_ioc_dip          : 33
NO:80         [chars           ] skyeye_id            :
NO:81         [chars           ] skyeye_index         :
NO:82         [chars           ] skyeye_serial_num    : QbJK/tb6A
NO:83         [chars           ] skyeye_type          : webids-webattack_dolog
NO:84         [float           ] sport                : 46742
NO:85         [kv              ] d0                   : d0:fd:2b:4e:80
NO:86         [digit           ] super_attack_chain   : 0
NO:87         [chars           ] super_type           : 攻击利用
NO:88         [chars           ] type                 : 信息泄露
NO:89         [digit           ] type_chain           : 16160000
NO:90         [float           ] update_time          : 1684219300
NO:91         [chars           ] vlan_id              :
NO:92         [chars           ] vuln_type            : 发现敏感目录/文件探测行为
NO:93         [chars           ] x_forwarded_for      :


```
