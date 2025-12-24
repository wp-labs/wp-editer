# Map组合



```
value   = map {
  process,memory_free  =  read() ;
  cpu_free,cpu_used_by_one_min, cpu_used_by_fifty_min  =  read() ;
  disk_free,disk_used,disk_used_by_one_min, disk_used_by_fify_min  =  read() ;
}
```