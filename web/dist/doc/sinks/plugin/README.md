# Plugin

plugin机制是为了解析一些不能做通用解析的数据，比如protobuf格式的数据，这些数据需要通过专门的.proto文件定义的结构体
才能够正确解析数据，需要做定制开发。

**plugin机制目前支持格式：**
- protobuf

**plugin机制目前支持设备：**
- 天眼/天堤设备发送的protobuf格式的日志数据，插件解析器id为[QAX-SKYEYE]

### 启动wpflow解析protobuf格式的日志数据

1、配置天眼日志解析的ldm模型
```shell
wpcfg ldm td_log
```
运行以上命令会在ldm/td_log目录下包含登录日志和DNS日志解析的模版例子，里面包括加载解析规则和解析结果输出配置等共8个文件。

- sample.dat：文件里面是proto-test文本格式的日志数据，该文本格式可以和protobuf格式相互转换
- gen_rule.wpl：构造天眼日志数据的规则
- gen_field.toml: 结合gen_rule.wpl使用的文件，可以定义规则里面字段的类型、数据格式和数据范围
- parse.wpl: 解析天眼日志的规则配置文件
```wpl
    package /svc/td_log {
       rule login {
            @plugin(id: QAX-SKYEYE,rule: "(kv(digit@message_type),chars<skyeye_login {,>,kv(chars@serial_num),kv(time@access_time),kv(ip@sip),kv(digit@sport),kv(ip@dip),kv(digit@dport),kv(chars@proto),kv(chars@passwd),kv(chars@info),kv(chars@user),kv(chars@db_type),kv(chars@normal_ret),kv(chars@vendor_id),kv(ip@device_ip),chars<user_define {,>,kv(chars@name),kv(chars@type),kv(chars@value),chars<},>,chars<},>)")
       }
       rule login1 {
            @plugin(id: QAX-SKYEYE,rule: "(kv(digit@message_type),chars<skyeye_login {,>,kv(chars@serial_num),kv(time@access_time),kv(ip@sip),kv(digit@sport),kv(ip@dip),kv(digit@dport),kv(chars@proto),kv(chars@passwd),kv(chars@info),kv(chars@user),kv(chars@db_type),kv(chars@normal_ret),kv(chars@vendor_id),kv(ip@device_ip),chars<},>)")
       }
    }
```
  - @plugin: 在规则最外层包上，指定用plugin的方式解析数据
  - id: 指定解析插件，[QAX-SKYEYE] 为天堤/天眼日志日志解析器，支持解析protobuf数据
  - rule: 是数据解析规则

- adm.toml、 pdm.toml: 对解析后的数据做字段映射，可自定义字段名
- sink.toml: 解析成功的数据输出路径，默认是以kv的格式发送到本地文件


2、启动wpflow
```shell
wpflow init
wpflow work
```
plugin解析器目前仅支持输入源是kafka的数据解析，所以source_ref需要指定配置为`source_kafka`

### 构造数据测试wpflow解析protobuf数据解析功能

1、配置wpgen.toml文件，需要配置输出格式为`proto`和输出sink为`kafka`
```shell
./wpgen init
```

以下是配置的例子：
```toml
version = "1.0"

[main_conf]
gen_ref = "sample_gen"
gen_speed = 1000
gen_count = 1000
gen_secs = 0
gen_parallel = 1
out_ref = "out_kafka"

[rule_gen]
rule_path = "./ldm/"

[sample_gen]
path = "./ldm/"

[out_file.fmt]
fmt = "proto"

[out_file.target.file]
path = "./gen.dat"

[out_kafka.fmt]
fmt = "proto"

[out_kafka.target.kafka]
brokers = "localhost:9092"
topic = "td_skyeye_test"
config = ["queue.buffering.max.messages = 50000", "queue.buffering.max.kbytes = 2147483647", "message.max.bytes = 10485760"]

[out_syslog.fmt]
fmt = "proto"

[out_syslog.target.syslog]
addr = "127.0.0.1"
port = 514
protocol = "udp"
```

2、发送protobuf数据到指定的kafka的topic

通过样本数据构建测试数据，需要在ldm目录下有sample.dat文件：
```shell
./wpgen sample -n 10000000 -s 5000
```

通过规则构建测试数据，需要在ldm目录下有gen_rule.wpl和gen_field.toml文件：
```shell
./wpgen rule -n 10000000 -s 5000
```

### 解析天眼/天堤日志解析规则示例
- **login**

```txt
message_type: 7 skyeye_login {serial_num: "654613123_login" access_time: "2020-10-10 12:00:00" sip: "10.2.3.2" sport: 22 dip: "1.0.2.3" dport: 5432 proto: "proto" passwd: "46464864" info: "info" user: "admin" db_type: "alert" vendor_id: "1345456464" device_ip: "10.3.2.1" user_define {name: "user_name" type: "string" value: "qqqqq"}}

(kv(digit@message_type),chars<skyeye_login {,>,kv(chars@serial_num),kv(time@access_time),kv(ip@sip),kv(digit@sport),kv(ip@dip),kv(digit@dport),kv(chars@proto),kv(chars@passwd),kv(chars@info),kv(chars@user),kv(chars@db_type),kv(chars@normal_ret),kv(chars@vendor_id),kv(ip@device_ip),chars<user_define {,>,kv(chars@name),kv(chars@type),kv(chars@value),chars<},>,chars<},>)
```
- **file_behavior**

```txt
message_type: 5 skyeye_file {serial_num: "cc38f5254b86b145e36805689f09a829" proto: "http" access_time: "2023-09-19 11:38:56.823" sip: "192.168.118.189" sport: 17827 dip: "210.46.20.50" dport: 80 uri: "/ye2ocxxotuyx3sbdgm" host: "h59khqgs0m6oi6ha7dghs4w0x.org" status: "200" file_dir: 1 filename: "m4x7dzx1w9z7xxafm6.yml" mime_type: "application/octet-stream" file_md5: "vy2kd4t31kgfpnnw9s0mwafcnhk0w0ft" method: "POST" vendor_id: "cs01v.dev.bjmc.qianxin-inc.cn" device_ip: "10.48.56.215"}

(kv(digit@message_type),chars<skyeye_file {,>,kv(chars@serial_num),kv(@proto),kv(time@access_time),kv(ip@sip),kv(digit@sport),kv(ip@dip),kv(digit@dport),kv(chars@uri),kv(chars@host),kv(chars@status),kv(digit@file_dir),kv(chars@filename),kv(chars@mime_type),kv(chars@file_md5),kv(chars@method),kv(chars@vendor_id),kv(ip@device_ip),chars<},>)
```
- **db**

```txt
message_type: 8 skyeye_sql {serial_num: "cc38f5254b86b145e36805689f09a829" access_time: "2023-09-19 15:18:23.366" sip: "192.168.132.65" sport: 51294 dip: "192.168.33.78" dport: 1434 proto: "sqlserver" version: "1.0.0.123" db_type: "sqlserver" user: "nsf25ie" db_name: "3egp0" ret_code: "success" sql_info: "use noah" normal_ret: "success" vendor_id: "cs01v.dev.bjmc.qianxin-inc.cn" device_ip: "10.48.56.215"}    

(kv(digit@message_type),chars<skyeye_sql {,>,kv(chars@serial_num),kv(time@access_time),kv(ip@sip),kv(digit@sport),kv(ip@dip),kv(digit@dport),kv(@proto),kv(chars@version),kv(chars@db_type),kv(chars@user),kv(@db_name),kv(chars@ret_code),kv(chars@sql_info),kv(chars@normal_ret),kv(chars@vendor_id),kv(ip@device_ip),chars<},>)
```
- **ldap**

```txt
message_type: 8 skyeye_sql {serial_num: "cc38f5254b86b145e36805689f09a829" access_time: "2023-09-19 15:18:23.366" sip: "192.168.132.65" sport: 51294 dip: "192.168.33.78" dport: 1434 proto: "sqlserver" version: "1.0.0.123" db_type: "sqlserver" user: "nsf25ie" db_name: "3egp0" ret_code: "success" sql_info: "use noah" normal_ret: "success" vendor_id: "cs01v.dev.bjmc.qianxin-inc.cn" device_ip: "10.48.56.215"}    

(kv(digit@message_type),chars<skyeye_ldap {,>,kv(chars@serial_num),kv(@proto),kv(time@access_time),kv(ip@sip),kv(digit@sport),kv(ip@dip),kv(digit@dport),kv(@user),kv(chars@version),kv(chars@op),kv(chars@info),kv(chars@vendor_id),kv(ip@device_ip),chars<},>)
```

- **ssl**

```txt
message_type: 11 skyeye_ssl {serial_num: "cc38f5254b86b145e36805689f09a829" access_time: "2023-09-19 16:20:04.827" sip: "192.168.67.142" sport: 5845 dip: "36.56.106.151" dport: 22 version: "TLS 1.2" session_id: "k0r610sgsss1f7ahgyp2ve3cqd97ackamb80yhg2l4xgg1wtf5whvvka7pnvbrda" server_name: "mmddsbiz.qpisssc.cn" user_name: "/C=CN/ST=guangdong/L=shenzhen/O=Shenzhen Tencent Computer Systems Company Limited/CN=*.cloud.tencent.com" vendor_id: "cs01v.dev.bjmc.qianxin-inc.cn" device_ip: "10.48.56.215"}

(kv(digit@message_type),chars<skyeye_ssl {,>,kv(chars@serial_num),kv(time@access_time),kv(ip@sip),kv(digit@sport),kv(ip@dip),kv(digit@dport),kv(chars@version),kv(chars@session_id),kv(chars@server_name),kv(chars@user_name),kv(chars@vendor_id),kv(ip@device_ip),chars<},>)
```
- **ftpop**

```txt
message_type: 12 skyeye_ftpop {serial_num: "cc38f5254b86b145e36805689f09a829" proto: "ftp_control" access_time: "2023-09-19 17:29:37.418" sip: "192.168.195.118" sport: 43317 dip: "192.168.25.189" dport: 20 user: "admin" seq: 123 op: "LCD" ret: "ok" vendor_id: "cs01v.dev.bjmc.qianxin-inc.cn" device_ip: "10.48.56.215"}

(kv(digit@message_type),chars<skyeye_ftpop {,>,kv(chars@serial_num),kv(@proto),kv(time@access_time),kv(ip@sip),kv(digit@sport),kv(ip@dip),kv(digit@dport),kv(@user),kv(digit@seq),kv(chars@op),kv(chars@ret),kv(chars@vendor_id),kv(ip@device_ip),chars<},>)
```
- **abnormal**

```txt
message_type: 20 skyeye_abnormal {serial_num: "cc38f5254b86b145e36805689f09a829" access_time: "2023-09-19 19:41:21.055" type: "abnormal icmp" sip: "192.168.57.214" sport: 30494 dip: "171.15.40.38" dport: 99 data: "fpgz8rete3oyytms35ybyne7y8c21gpmowv4uc7ch9999r0yx26mrsoh84qgez7z0fwrgpv9nnyalcmif0s5bvrawf8xbd63dyk2zv2wgg56v9os1wwy1gm37wgfrg34dw1aq0g8szxf2nltgiuiecuvkck1anlyabh7tzzhb8myqvelk6ii9mvnu3nz5ntol9mm1tecdm4r0kazmk9kz6tq1thcf3fgiv85l0rtdogn8bancvpqm0g5c1g2t5y7ttpaqggztwrkhnia9wg6h5u35cgoufggaiyfy6e7voxr3whgy3d2lgllqivq642v140y8m7st5slv68sfcsc81hf1f2k2lakld25eege9yscs1zgxnii2ca0obgqtswxoy8ag69bcdde2m542zlamung0d540g8r8i6z6mn86839qkncql7acatk5m9qiquan3wauzikfk6r7odmbhvthh003m9ovb19zfu6tc9" datalen: 487 info: "msg_type:11,msg_code:1,src_mac:50:da:00:f1:e3:e6,dst_mac:9c:06:1b:00:63:d6," vendor_id: "cs01v.dev.bjmc.qianxin-inc.cn" device_ip: "10.48.56.215"}

(kv(digit@message_type),chars<skyeye_abnormal {,>,kv(chars@serial_num),kv(time@access_time),kv(@type),kv(ip@sip),kv(digit@sport),kv(ip@dip),kv(digit@dport),kv(chars@data),kv(digit@datalen),kv(chars@info),kv(chars@vendor_id),kv(ip@device_ip),chars<},>)
```
- **telnetcmd**

```txt
message_type: 22 skyeye_telnetcmd {serial_num: "cc38f5254b86b145e36805689f09a829" proto: "telnet" access_time: "2023-09-19 19:02:40.529" sip: "192.168.210.34" sport: 26878 dip: "192.168.50.66" dport: 7990 user: "test" cmd: "PUT" ret: "hasdfij hahahahah" vendor_id: "cs01v.dev.bjmc.qianxin-inc.cn" device_ip: "10.48.56.215"}

(kv(digit@message_type),chars<skyeye_telnetcmd {,>,kv(chars@serial_num),kv(@proto),kv(time@access_time),kv(ip@sip),kv(digit@sport),kv(ip@dip),kv(digit@dport),kv(@user),kv(@cmd),kv(chars@ret),kv(chars@vendor_id),kv(ip@device_ip),chars<},>)
```

- **tcpflow**

```txt
message_type: 2 skyeye_tcpflow {serial_num: "cc38f5254b86b145e36805689f09a829" status: "fin" stime: "2023-09-20 11:45:34.399" dtime: "2023-09-20 11:45:34.400" sip: "192.168.4.200" sport: 6208 dip: "36.56.15.48" dport: 443 proto: "https" uplink_length: 327 downlink_length: 117 client_os: "Windows" server_os: "Linux 3.x" src_mac: "00:50:56:9c:4a:cf" dst_mac: "28:51:32:10:5e:4e" up_payload: "zhz6aq7g5r4gi2qql7hqbvl5n0ergf1oetgs9g0vhea7k44rbcm0dt0b94neq9ou8cxrg6l69gcvly7irmapi09ckby9at1cino6h0abpnst0qw8wym8rqwp7vwkac22vxdayqooygutreln23l55olgf682oadgra4ap75gkis24vgg52ctu94gq70b6n8ugqcb603m22bxss4cv9nw3cxpkb94dgywq6e9sdtb8q2pz31x9ills0pt8l68tpry11ib5ir4mbbfh2f954zxluelulo5yis833zlbe9gt37auuva6np4a26gf7zsg6vegpmwb6f" down_payload: "koxmz1hq7707m8yezeng346f9x4i1lklc95k0u8dwfig4wa6zfmqc1g5gadqxmpicvsgfwt7lxef4m9zsq2eh4q1rxcsedq0b1g8gik22by1axr52fsby" summary: "2;0;1460;1460" uplink_pkts: 1 downlink_pkts: 2 access_time: "2023-09-20 11:45:34.399" vendor_id: "cs01v.dev.bjmc.qianxin-inc.cn" device_ip: "10.48.56.215" app_type: 16}

(kv(digit@message_type),chars<skyeye_tcpflow {,>,kv(chars@serial_num),kv(chars@status),kv(time@stime),kv(time@dtime),kv(ip@sip),kv(digit@sport),kv(ip@dip),kv(digit@dport),kv(chars@proto),kv(digit@uplink_length),kv(digit@downlink_length),kv(chars@client_os),kv(chars@server_os),kv(chars@src_mac),kv(chars@dst_mac),kv(chars@up_payload),kv(chars@down_payload),kv(chars@summary),kv(digit@uplink_pkts),kv(digit@downlink_pkts),kv(time@access_time),kv(chars@vendor_id),kv(ip@device_ip),kv(digit@app_type),chars<},>)
```
- **dns**

```txt
message_type: 3 skyeye_dns {serial_num: "cc38f5254b86b145e36805689f09a829" access_time: "2023-09-20 18:56:28.605" sip: "192.168.23.100" sport: 48625 dip: "6.6.6.6" dport: 53 dns_type: 0 host: "ck2aapvgwp2ro9vu7c.org" vendor_id: "cs01v.dev.bjmc.qianxin-inc.cn" device_ip: "10.48.56.215"}

(kv(digit@message_type),chars<skyeye_dns {,>,kv(chars@serial_num),kv(time@access_time),kv(ip@sip),kv(digit@sport),kv(ip@dip),kv(digit@dport),kv(digit@dns_type),kv(chars@host),kv(chars@vendor_id),kv(ip@device_ip),chars<},>)
```
- **weblog**

```txt
message_type: 4 skyeye_weblog {serial_num: "cc38f5254b86b145e36805689f09a829" access_time: "2023-09-20 18:56:28.605" sip: "192.168.136.210" sport: 42293 dip: "182.92.179.91" dport: 80 uri: "/mvy39pvx8lt" host: "32cte0ec86af8h6i1.org" agent: "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36," data: "7g7mmvpgy5ru6zln2ez1gy28in75ml95gomq2au4c1w67zh87h32tgviiqbmfc7abg7oy1fvwa0iqf3twdmqlkiuw0g9xiycfgrpwfxk4q3wg8yqyyzfwm4iygnc6no83h53idgsiiquh58mosgtm5dziiqhy2eqk9144qtvg64gd3vztrginmhpbporvos6zc4b7vypt7p7q9xrzvqoikssp7mzu0h35ud5rszihbevho4rdso63vegcvf8mu7yk3hw802xxouiawlu0yqc0lvv5xkylwpv2zvax3unbkukts0i251rgra46xgh07y222ngvir8hdtapg91l18ihodydfviz6gvwh6pmhs7i5g6v54o3agddhapl398tvldgyg617b2qaiyar5nacr1w5bwy1obgmalnaf55cqg9y3msxfh9g04yemkc1t384bzgllzdxybb7ssyzogg0o0ikolw3nd18or23xuv6zq47g6fg7xghytlopn4fioiv18nxswsyxbp8ovlqr3rfb1v99dmuzorpyfuddp7yg8d5r8l6tlg71qno8gl69aglro4gdbylw30llcugh6fgz7q9a4h8hpmngfv338m0hdq6rnldskz8m54zr1y8ypakg88wz76evp73st6i8xvgxzofricrgmpcp6kd2s4sthn4ly15q9v6t5z45p3fw1sq9qu0c8xi5zz5tbdoxikr57hi2kwp5taelkmfvu4e94amggmnf6kcdipgr42ygucm9wsg16z3q8regvibvqprmosgmtxwst2vq2h" method: "POST" status: 200 content_type: "" accept_language: "zh-CN,zh;q=0.8" vendor_id: "cs01v.dev.bjmc.qianxin-inc.cn" device_ip: "10.48.56.215" urlcategory: 12}   

(kv(digit@message_type),chars<skyeye_weblog {,>,kv(chars@serial_num),kv(time@access_time),kv(ip@sip),kv(digit@sport),kv(ip@dip),kv(digit@dport),kv(chars@uri),kv(chars@host),kv(chars@agent),kv(chars@data),kv(chars@method),kv(digit@status),kv(chars@content_type),kv(chars@accept_language),kv(chars@vendor_id),kv(ip@device_ip),kv(digit@urlcategory),chars<},>)
```
- **mail**

```txt
message_type: 6 skyeye_mail {serial_num: "cc38f5254b86b145e36805689f09a829" proto: "pop3" access_time: "2023-09-20 18:56:28.605" sip: "192.168.52.29" dip: "191.87.133.174" sport: 15534 dport: 110 time: "2023-09-20 18:56:28" mail_from: "udmhzvoeqn@mphvhfvefgoogj.a" to: "bgqmhnsvml@rnnad.h" cc: "eattzashkksrbwhoxb@oacdkyidani.hh" subject: "3uhgpl1ewy8hc75rk0lql31g7n5wyeiyuse2c4bsl6o09qdea5cppha57wkqlq040ko6y66ahwb37ugmi1hbv29elxyteq3ox1avohvhipqoimo4qcxp708ghz8171udqsw7aclovp0g99ngckrv4cih85mnigdsipfk4brgdgyv28glg7w5zgyglcn5c1g7tv3cderkuw31g063wh7nc4q694box5nq8rr1vqctwf0mtu6fpgdkunt2e8n3xxm8xtn04l5p39sav0pswiqqz8ipy1v84f15zcghk10gl2xpn8xmhrg8x7gm4rme1t5in5eclhks8iry7hsq6haxl53d5tlodyka7g8x9pl27s778gl35y6q74yvgcbkg37pm0zk15itrdxmdf3i5ewgief798tot2ywo6mh5pdwuckg0b4yinpdguwlk0mtqd1mxqygpm932qw275ggxz5u7g062pncduhc6gykliagnfamngsy9yv3o4vimrng7n41q2z2krk33vq90kqnul00uq1o0hngngf2ur9rfkvbc9rf2xg45ob9fvac4ou0zmvyklfp69b0pmaks3qoc3kp5mmiz4lpxdy5ulhdkewtq5i7z270691uda5fwco4ima0rec3b8irk74avgqekbryb1r3bp6cugt2gizr51hle0f401nxwgtf2e8ddqfglvpv8ubd7v50cr4klke6wmczkmlpl5o2u6ocnhg999nnrtaz8" plain: "ieyxfroqlmqscvhz6a30rd9u8ehi2ztk4bwqpqqgd8cth6ztmqx8wp20u2s3d8qxqzz59zf24nkwq93121bn4lyoth7u5afdig0uof5xw6bfaovan10fdgof9ure3x28olntbpix6rtd72q54n5bamltv7krn2usid4z4xt19dyqsvsymb6nllf1z7d625sb56ircg3znr5zhvets1gw4llkk1nlap6af6apo9eok7guygaxrp4ohhv2rnvaca6wwbo1mp4gdrxtu3zuymkhuhm6z3gzpcoefg43knwm5dtbriy2mmw55u1hhmfmn8ewlr1fo4ripvr0koxgvccysvouw5d2c6mtpvomg34u5u4od9vacz0rtdgz1uzk pdf 7qa91uahtm6lbisn4sq1agzqunkpb6re0z4uag1yu1sloounec3ly5eiho01plpibn6g73gnprymk9wk6sewg9ctss24pqrxu52w0vmpt8hga782tyl9492rrxe2k5aoi22qndtnsqgfglnqz0ukp7gb2w4nifmmfal7q8eig7yuhksg03gcfbdhhswnp4qgh1305tl" attachment {attach_md5: "9n6ib9kyqsful8z82o5bsbn15ked9upy" mime_type: "application/octet-stream" name: "554c82v1a139t."} received: "bgqmhnsvml@rnnad.h" received: "eattzashkksrbwhoxb@oacdkyidani.hh" vendor_id: "cs01v.dev.bjmc.qianxin-inc.cn" device_ip: "10.48.56.215"}

(kv(digit@message_type),chars<skyeye_mail {,>,kv(chars@serial_num),kv(chars@proto),kv(time@access_time),kv(ip@sip),kv(ip@dip),kv(digit@sport),kv(digit@dport),kv(time@time),kv(chars@mail_from),kv(chars@to),kv(chars@cc),kv(chars@subject),kv(chars@plain),chars<attachment {,>,kv(chars@attach_md5),kv(chars@mime_type),kv(chars@name),chars<},>,kv(chars@received),kv(chars@received),kv(chars@vendor_id),kv(ip@device_ip),chars<},>)
```

- **udpflow**

```txt
message_type: 16 skyeye_udpflow {serial_num: "cc38f5254b86b145e36805689f09a829" stime: "2023-09-20 18:56:28.606" dtime: "2023-09-20 18:56:28.606" sip: "192.168.87.165" sport: 47776 dip: "36.63.147.25" dport: 55672 uplink_length: 275 downlink_length: 641 uplink_pkts: 1 downlink_pkts: 1 up_payload: "g9l0szgf1a4rix3ost4rsfvoufgt4wz61i7dp0ctbbzaqk65tkwaa2szyv2sgbmwnpeg4z7vuw7tdqihccmtkbpfwt07bgbw8awvyhbqpnrb01kc8kukekgfp8k0ld0o06giig3o8blg50ire94mgrdod045z6ci9dtigz0cd2zyqgolmr003mzgzgabg0o6higng7suicf4i6gvs9u767ml0yz5ktaixydnnl7q0i30911cn39wp4p24o0dyvmsso7c37kda44gfggszyv" down_payload: "l7f6v5wk3gqby3odnq6z0f1ya7154yevpe4iote6etvsb74rhsl0ekqykti8sokoh0vif04l0k6nmomro7ccvu6l5ys3xdewkpfq437ibbrft58lgka6xvo7nwb6ap7duqtvviqfzyo928c1uupry1dwpl6w57n1kywxwxcl7670rvh751iun5rlgc2dk12iqyhrig8gzlxhyr4zttw847oceimn8w0aqs8qr63cwpt78s7pnf1ct7z27pgghnu332hp6kaixagb1egpfqaz21c7mzhnzlegannoa2qwzm65dk57bui1n4r0bf0zudugpg3xwv5v5z6ccgw0uou9sxcbiagiqg5xf7khsptwbsdke4giprqflsbpdzn97yb6panggaxx6ivenwtau3es1k5glegclgozapskv7hv1szu7iv8t890ir4g4god3a9n7aqf14db8q2nl4zd4zv6ena3h3enb04kgvam48ebg8fq3737qrmrylqpdpdgv5rp2rkli52ptacyrb174wcybchfft0okh1u9z8dapvrq5vr2cwmgrugrmprbs7o7kmfc9hm3t4g3pkz49gyyn7g3tr76gg86das1vfnr0xgsc47l0t9d8gnz6o5805gadh56" src_mac: "00:51:56:9c:4a:cf" dst_mac: "28:21:32:10:5e:4e" proto: "udp" access_time: "2023-09-20 18:56:28.605" vendor_id: "cs01v.dev.bjmc.qianxin-inc.cn" device_ip: "10.48.56.215" app_type: 26}

(kv(digit@message_type),chars<skyeye_udpflow {,>,kv(chars@serial_num),kv(time@stime),kv(time@dtime),kv(ip@sip),kv(digit@sport),kv(ip@dip),kv(digit@dport),kv(digit@uplink_length),kv(digit@downlink_length),kv(digit@uplink_pkts),kv(digit@downlink_pkts),kv(chars@up_payload),kv(chars@down_payload),kv(chars@src_mac),kv(chars@dst_mac),kv(chars@proto),kv(time@access_time),kv(chars@vendor_id),kv(ip@device_ip),kv(digit@app_type),chars<},>)
```
- **ioc**

```txt
message_type: 23 skyeye_ioc {access_time: 1695207388473 tid: 1 type: "attack" rule_desc: "rule_desc" offence_type: "offence_type" offence_value: "offence_value" sip: "171.15.217.8" dip: "192.168.108.36" serial_num: "cc38f5254b86b145e36805689f09a829" rule_state: "rule_state" ioc_type: "ioc_type" ioc_value: "ioc_value" nid: "nid" etime: "2021-01-22 12:33:40" malicious_type: "malicious_type" kill_chain: "kill_chain" confidence: "confidence" malicious_family: "malicious_family" tag: "tag" platform: "platform" current_status: "current_status" packet_data: "packet_data" ioc_source: 0 sport: 46209 dport: 14125 proto: "proto" dns_type: 1 filename: "filename" file_md5: "file_md5" desc: "desc" file_direction: 1 host: "host" uri: "uri" dns_arecord: "dns_arecord" tproto: "tproto" file_content: "file_content" attack_ip: "171.15.217.8" victim_ip: "192.168.108.36" attack_type: "attack_type" vendor_id: "cs01v.dev.bjmc.qianxin-inc.cn" device_ip: "10.48.56.215"}

(kv(digit@message_type),chars<skyeye_ioc {,>,kv(time_timestamp@access_time),kv(digit@tid),kv(chars@type),kv(chars@rule_desc),kv(chars@offence_type),kv(chars@offence_value),kv(ip@sip),kv(ip@dip),kv(chars@serial_num),kv(chars@rule_state),kv(chars@ioc_type),kv(chars@ioc_value),kv(chars@nid),kv(time@etime),kv(chars@malicious_type),kv(chars@kill_chain),kv(chars@confidence),kv(chars@malicious_family),kv(chars@tag),kv(chars@platform),kv(chars@current_status),kv(chars@packet_data),kv(digit@ioc_source),kv(digit@sport),kv(digit@dport),kv(chars@proto),kv(digit@dns_type),kv(chars@filename),kv(chars@file_md5),kv(chars@desc),kv(digit@file_direction),kv(chars@host),kv(chars@uri),kv(chars@dns_arecord),kv(chars@tproto),kv(chars@file_content),kv(ip@attack_ip),kv(ip@victim_ip),kv(chars@attack_type),kv(chars@vendor_id),kv(ip@device_ip),chars<},>)
```

- **webshell**

```txt
message_type: 30 skyeye_webshell {serial_num: "cc38f5254b86b145e36805689f09a829" rule_id: 1 sip: "192.168.93.27" sport: 20359 dip: "139.209.123.3" dport: 45665 host: "lmok1234xing.w239.dns911.cn" url: "url" file_md5: "a4oht3rozw7pnw03mu1n1oxqznq25rzk" file: "file" attack_type: "pass" file_dir: "filedir" victim_type: "victim_type" attack_flag: "attack" attacker: "attacker" victim: "victim" write_date: 1695207388 severity: 1 confidence: 1 detail_info: "detail_info-" webrules_tag: "webrules_tag" attack_desc: "attack_desc" attack_harm: "attack_harm" rule_name: "rule_name" kill_chain: "kill_chain" attack_result: "1" vendor_id: "cs01v.dev.bjmc.qianxin-inc.cn" device_ip: "10.48.56.215" mpls_label: "mpls_label" sess_id: "sess_id" attack_type_id: 1}

(kv(digit@message_type),chars<skyeye_webshell {,>,kv(chars@serial_num),kv(digit@rule_id),kv(ip@sip),kv(digit@sport),kv(ip@dip),kv(digit@dport),kv(chars@host),kv(chars@url),kv(chars@file_md5),kv(chars@file),kv(chars@attack_type),kv(chars@file_dir),kv(chars@victim_type),kv(chars@attack_flag),kv(chars@attacker),kv(chars@victim),kv(digit@write_date),kv(digit@severity),kv(digit@confidence),kv(chars@detail_info),kv(chars@webrules_tag),kv(chars@attack_desc),kv(chars@attack_harm),kv(chars@rule_name),kv(chars@kill_chain),kv(chars@attack_result),kv(chars@vendor_id),kv(ip@device_ip),kv(chars@mpls_label),kv(chars@sess_id),kv(digit@attack_type_id),chars<},>)
```
- **webattack**

```txt
message_type: 18 skyeye_webattack {serial_num: "cc38f5254b86b145e36805689f09a829" rule_id: 1 rule_name: "rule_name" dolog_count: 1 severity: 1 rule_version: 1 sip: "192.168.66.78" dip: "171.13.225.116" sport: 38968 dport: 1 method: "method" host: "host" uri: "uri" file_name: "file_name" referer: "referer" agent: "agent" cookie: "cookie" parameter: "parameter" req_header: "req_header" req_body: "req_body" rsp_status: 1 rsp_content_length: 1 rsp_content_type: "rsp_content_type" rsp_header: "rsp_header" rsp_body: "rsp_body" rsp_body_len: 1 victim_type: "victim_type" attack_flag: "attack" attacker: "192.168.66.78" victim: "171.13.225.116" write_date: 1695207389 attack_type: "attack_type" confidence: 1 detail_info: "detail_info" solution: "solution" vuln_desc: "vuln_desc" vuln_harm: "vuln_harm" vuln_name: "vuln_name" vuln_type: "vuln_type" webrules_tag: "webrules_tag" public_date: "public_date" code_language: "code_language" site_app: "site_app" kill_chain: "kill_chain" attack_result: "1" vendor_id: "cs01v.dev.bjmc.qianxin-inc.cn" device_ip: "10.48.56.215" attack_type_id: 1}

(kv(digit@message_type),chars<skyeye_webattack {,>,kv(chars@serial_num),kv(digit@rule_id),kv(@rule_name),kv(digit@dolog_count),kv(digit@severity),kv(digit@rule_version),kv(ip@sip),kv(ip@dip),kv(digit@sport),kv(digit@dport),kv(chars@method),kv(chars@host),kv(chars@uri),kv(chars@file_name),kv(chars@referer),kv(chars@agent),kv(chars@cookie),kv(chars@parameter),kv(chars@req_header),kv(chars@req_body),kv(digit@rsp_status),kv(digit@rsp_content_length),kv(chars@rsp_content_type),kv(chars@rsp_header),kv(chars@rsp_body),kv(digit@rsp_body_len),kv(chars@victim_type),kv(chars@attack_flag),kv(chars@attacker),kv(ip@victim),kv(digit@write_date),kv(chars@attack_type),kv(digit@confidence),kv(chars@detail_info),kv(chars@solution),kv(chars@vuln_desc),kv(chars@vuln_harm),kv(chars@vuln_name),kv(chars@vuln_type),kv(chars@webrules_tag),kv(chars@public_date),kv(chars@code_language),kv(chars@site_app),kv(chars@kill_chain),kv(chars@attack_result),kv(chars@vendor_id),kv(ip@device_ip),kv(digit@attack_type_id),chars<},>)
```
- **property**

```txt
message_type: 31 skyeye_property {token: "token" timestamp: "1695207388460" source: "source" assets: "assets" sess_id: "sessid" sensor_name: "sensor_name" sensor_model: "sensor_model" sensor_vendor: "sensor_vendor" sensor_cpe: "sensor_cpe" serial_num: "cc38f5254b86b145e36805689f09a829" vendor_id: "cs01v.dev.bjmc.qianxin-inc.cn" device_ip: "10.48.56.215"}

(kv(digit@message_type),chars<skyeye_property {,>,kv(chars@token),kv(time_timestamp@timestamp),kv(chars@source),kv(chars@assets),kv(chars@sess_id),kv(chars@sensor_name),kv(chars@sensor_model),kv(chars@sensor_vendor),kv(chars@sensor_cpe),kv(chars@serial_num),kv(chars@vendor_id),kv(ip@device_ip),chars<},>)
```
- **icmp**

```txt
message_type: 32 skyeye_icmp {serial_num: "cc38f5254b86b145e36805689f09a829" sip: "192.168.5.132" sipv6: "sipv6" dip: "61.234.153.148" dipv6: "dipv6" proto: "proto" src_mac: "00:50:56:9c:4a:cf" dst_mac: "28:51:32:10:5e:4e" access_time: "2023-09-20 18:56:28.605" vendor_id: "cs01v.dev.bjmc.qianxin-inc.cn" device_ip: "10.48.56.215" mpls_label: "mpls_label" sess_id: "sessid" req_type: 1 req_code: 1 req_data: "reqdata" res_type: 1 res_code: 1 res_data: "resdata"}

(kv(digit@message_type),chars<skyeye_icmp {,>,kv(chars@serial_num),kv(ip@sip),kv(chars@sipv6),kv(ip@dip),kv(chars@dipv6),kv(chars@proto),kv(chars@src_mac),kv(chars@dst_mac),kv(time@access_time),kv(chars@vendor_id),kv(ip@device_ip),kv(chars@mpls_label),kv(chars@sess_id),kv(digit@req_type),kv(digit@req_code),kv(chars@req_data),kv(digit@res_type),kv(digit@res_code),kv(chars@res_data),chars<},>)
```
- **viruses**

```txt
message_type: 33 skyeye_viruses {access_time: 1695207388 sip: "192.168.145.10" sipv6: "sipv6" dip: "121.76.142.213" dipv6: "dipv6" sport: 27874 dport: 28567 attacker: "attacker" victim: "victim" app_id: 1 app_name: "appname" protol7_id: 1 protol7_name: "proto17name" direction: 1 rule_id: 1 rule_name: "rulename" malicious_type: "malicious_type" malicious_type_id: 1 malicious_family: "malicious_family" severity: 1 affected_platform: "affected_platform" desc: "desc" confidence: 1 kill_chain: "kill_chain" attack_result: "1" file_dir: "file_dir" filename: "filename" mime_type: "mime_type" file_md5: "0wpekh7p3ewrstlctwinsw06bxwndz2m" file_sha256: "filesha256" detect_method: 1 behaviour_label: "behaviour_label" vendor_id: "cs01v.dev.bjmc.qianxin-inc.cn" device_ip: "10.48.56.215" mpls_label: 1 sess_id: "sessid" serial_num: "cc38f5254b86b145e36805689f09a829"}

(kv(digit@message_type),chars<skyeye_viruses {,>,kv(time_timestamp@access_time),kv(ip@sip),kv(chars@sipv6),kv(ip@dip),kv(chars@dipv6),kv(digit@sport),kv(digit@dport),kv(chars@attacker),kv(chars@victim),kv(digit@app_id),kv(chars@app_name),kv(digit@protol7_id),kv(chars@protol7_name),kv(digit@direction),kv(digit@rule_id),kv(chars@rule_name),kv(chars@malicious_type),kv(digit@malicious_type_id),kv(chars@malicious_family),kv(digit@severity),kv(chars@affected_platform),kv(chars@desc),kv(digit@confidence),kv(chars@kill_chain),kv(chars@attack_result),kv(chars@file_dir),kv(chars@filename),kv(chars@mime_type),kv(chars@file_md5),kv(chars@file_sha256),kv(digit@detect_method),kv(chars@behaviour_label),kv(chars@vendor_id),kv(ip@device_ip),kv(chars@mpls_label),kv(chars@sess_id),kv(chars@serial_num),chars<},>)
```

### 注意事项：
- 如果想要更加简单的验证wpflow的功能，可以安装完wpflow后直接执行[wpflow-use](https://git-open.qianxin-inc.cn/org/dayu/wpflow-use)的usecase/source_plugin目录的case_verify.sh脚本，
  最终可以在out/td_skyeye_login.dat文件看到解析后的数据
- 天眼/天堤日志解析详细示例相关的配置可以查看[wpflow-use](https://git-open.qianxin-inc.cn/org/dayu/wpflow-use)的usecase/source_plugin