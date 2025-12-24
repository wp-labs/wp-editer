# 前置过程



##  base64



### 示例:

```
   rule fmt_base64 {
        |base64|(digit<<,>>,time,sn,time,chars^2,12*kv,2*_,7*kv,_)
   }
```

### 输入:

```
PDE4OD5NYXkgMTcgMDg6NTQ6MDYgS01ETERMSDNDVzIwMjBHMldBRkEwMSAyMDIzLTA1LTE3IDA4OjU0OjA2IFdBRjogMTAuMTgxLjIxLjE3NDo2MTk3OC0+MTAuMTgwLjM5LjEyIGRpcD0xMC4xODAuMzkuMTIgZGV2aWNlbmFtZT1LTURMRExIM0NXMjAyMEcyV0FGQTAxIHVybD0vT01TL3VwbG9hZEZpbGUuYWN0aW9uIG1ldGhvZD1QT1NUIGFyZ3M9IGZsYWdfZmllbGQ9IGJsb2NrX3RpbWU9MCBodHRwX3R5cGU9IGF0dGFja19maWVsZD0xIHByb2ZpbGVfaWQ9MSBydWxlX2lkPTcwMDAxIHR5cGU9U2lnbmF0dXJlIFJ1bGUgc2V2ZXJpdHk9MiBhY3Rpb249UkVKRUNUIHJlZmVyZXI9IHVzZXJhZ2VudD0gcG9zdD0gZXF1aXBtZW50PTIgb3M9OCBicm93c2VyPTAgfA==
```


### 输出:

```
{"digit":"188","time":"2024-05-17 08:54:06","sn":"KMDLDLH3CW2020G2WAFA01","time":"2023-05-17 08:54:06","chars":"WAF: 10.181.21.174:61978->10.180.39.12","dip":"10.180.39.12","devicename":"KMDLDLH3CW2020G2WAFA01","url":"/OMS/uploadFile.action","method":"POST","args":"","flag_field":"","block_time":"0","http_type":"","attack_field":"1","profile_id":"1","rule_id":"70001","type":"Signature","action":"REJECT","referer":"","useragent":"","post":"","equipment":"2","os":"8","browser":"0"}
```



## esc_quato

去掉引号的转义

###  示例:

```
   rule fmt_json {
        |esc_quota|(json(_@data/context))
   }
```



### 输入:

```
"{\"faceCode\":\"mq_test_2\",\"data\":{\"bbaa\":\"aaaa@@@@aabbbb\",\"title\":\"张三丰\",\"context\":\"百岁自创太极厅椅枯枯要有木有地\"}}"
"{\"faceCode\":\"mq_test_2\",\"data\":{\"bbaa\":\"aaaa@@@@aabbbb\",\"title\":\"张三丰\",\"context\":\"百岁自创太极厅椅枯枯要有木有地\"}}"
"{\"faceCode\":\"mq_test_2\",\"data\":{\"bbaa\":\"aaaa@@@@aabbbb\",\"title\":\"张三丰\",\"context\":\"百岁自创太极厅椅枯枯要有木有地\"}}"
"{\"faceCode\":\"mq_test_2\",\"data\":{\"bbaa\":\"aaaa@@@@aabbbb\",\"title\":\"张三丰\",\"context\":\"百岁自创太极厅椅枯枯要有木有地\"}}"
"{\"faceCode\":\"mq_test_2\",\"data\":{\"bbaa\":\"aaaa@@@@aabbbb\",\"title\":\"张三丰\",\"context\":\"百岁自创太极厅椅枯枯要有木有地\"}}"
```



### 输出:



```
{"data/bbaa":"aaaa@@@@aabbbb","data/title":"张三丰","faceCode":"mq_test_2"}
{"data/bbaa":"aaaa@@@@aabbbb","data/title":"张三丰","faceCode":"mq_test_2"}
{"data/bbaa":"aaaa@@@@aabbbb","data/title":"张三丰","faceCode":"mq_test_2"}
{"data/bbaa":"aaaa@@@@aabbbb","data/title":"张三丰","faceCode":"mq_test_2"}
{"data/bbaa":"aaaa@@@@aabbbb","data/title":"张三丰","faceCode":"mq_test_2"}
{"data/bbaa":"aaaa@@@@aabbbb","data/title":"张三丰","faceCode":"mq_test_2"}
```
