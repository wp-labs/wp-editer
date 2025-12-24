# DvLIB

在内存上加载富化需要的知识库



## ADM定义需富化加载项

```toml
[[adm_item]]
name = "src_city"
meta = "chars"
default = "unknow"

[adm_item.fetch.load]
lib = "geo"
dat_key = "city_name"
arg_key = "src_ip"

[[adm_item]]
name = "from_zone"
meta = "chars"
default = "unknow"

[adm_item.fetch.load]
lib = "zone"
dat_key = "zone_name"
arg_key = "from_ip"

```



## 配置知识库加载

示例:

```toml
[[libs]]
[libs.table]
key = "dvron_shmlib_zone"
name = "zone"

[libs.table.define]
engine = "table_ip_f1c"

[[libs.table.define.schema.primary]]
type = "u32"
name = "ip_beg"
[[libs.table.define.schema.primary]]
type = "u32"
name = "ip_end"

[[libs.table.define.schema.fields]]
type = "str"
name = "zone_name"
[libs.load]
data = "./lib/zone.csv"
parse = 'rule load { (ip:ip_beg,ip:ip_end,chars:zone_name")\,}'
```



## 运行加载

命令:

```
dvlib work
```

输出:

```
  dvron_shmlib_geo   [*] total_count:      1000 item_size:        12 
 dvron_shmlib_city   [*] total_count:         8 item_size:       256 
 dvron_shmlib_zone   [*] total_count:         5 item_size:       256 
dvron_shmlib_device  [*] total_count:         5 item_size:       256 

enriching for : device_key: no_1
device_val: qax/beijgin
enriching for : ip: 10.0.20.10
zone_name: work_zone
enriching for : ip: 222.133.52.20
latitude: 37.1497
longitude: 116.418
city_name: 德州市
```

