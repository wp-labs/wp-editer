# dvliv_load.toml





```toml
[[libs]]

[libs.table]
# 字符与_组成的KEY.
key = "dvron_shmlib_geo"
name = "geo"

[libs.table.define]
# engine 不能改变.
engine = "table_geo"

[[libs.table.define.schema.primary]]
type = "u32"
name = "ip_beg"

[[libs.table.define.schema.primary]]
type = "u32"
name = "ip_end"

[[libs.table.define.schema.fields]]
type = "f32"
name = "latitude"

[[libs.table.define.schema.fields]]
type = "f32"
name = "longitude"

[[libs.table.define.schema.fields]]
type = "u32"
name = "city_name"

[libs.table.define.schema.fields.effect]
ref = "city_name"

[libs.table.check]
meta = "ip"
name = "ip"
value = "222.133.52.20"

[libs.load]
data = "./lib/geo.csv"
# 数据解析规则(DVL)
parse = 'rule load { (chars:city_name",float:latitude,float:longitude,digit:ip_beg,digit:ip_end)\, } '

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

[libs.table.check]
meta = "ip"
name = "ip"
value = "10.0.20.10"

[libs.load]
data = "./lib/zone.csv"
parse = 'rule load { (ip:ip_beg,ip:ip_end,chars:zone_name")\,}'

[[libs]]

[libs.table]
key = "dvron_shmlib_device"
name = "device"

[libs.table.define]
engine = "table_str_f1c"

[[libs.table.define.schema.primary]]
type = "str"
name = "device_key"

[[libs.table.define.schema.fields]]
type = "str"
name = "device_val"

[libs.table.check]
meta = "chars"
name = "device_key"
value = "no_1"

[libs.load]
data = "./lib/device.csv"
parse = 'rule load { (chars:device_key",chars:device_val")\,}'
```

