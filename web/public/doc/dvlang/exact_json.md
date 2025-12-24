# ExactJson

## 示例

```json
{"b":21,"c": "gogogo","a" : "aGVsbG8="}
```

```
(exact_json( @b, @c:x,base64@a))
```


## 语法
与 json一致.

### 区别

只有每个json值被标识, 才判定为成功解析, 否则失败.
