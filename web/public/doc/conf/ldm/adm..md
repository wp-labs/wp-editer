#  模型聚合文件



### 示例:

```toml

[[adm_item]]
name = "requ_status"
meta = "digit"
default = "200"

[adm_item.fetch.parse]
mapping = ["requ-status"]

[[adm_item]]
name = "resp_len"
meta = "digit"
default = "0"

[adm_item.fetch.parse]
mapping = ["resp-len"]

[[adm_item]]
name = "src_city"
meta = "chars"
default = "unknown"

[adm_item.fetch.load]
lib = "geo"
dat_key = "city_name"
arg_key = "src_ip"

[[adm_item]]
name = "from_zone"
meta = "chars"
default = "unknown"

[adm_item.fetch.load]
lib = "zone"
dat_key = "zone_name"
arg_key = "src_ip"
```

