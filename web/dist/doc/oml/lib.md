


#### LibQuery

```
src_city    = query lib(geo) where read(src_ip) {
        idx : src_ip,
        col : city_name,
        _  : chars(unknow)
};
```

