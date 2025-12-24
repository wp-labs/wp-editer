# wpL语法

## 字段语法

```abnf

FIELD     :: = META [:NAME][FMT]
META      :: = "chars" | "digit" | "float" | "ip" | "time" | ...
FMT       :: = "<" SCOPE_BEG "," SCOPE_END">" | "\""  | "\\" SEP_C 
SCOPE_BEG :: = VISI_CHAR
SCOPE_END :: = VISI_CHAR
SEP_C     :: = VISI_CHAR

```



## Group语法

```
GROUP :: =  [LOGIC_OP] "(" * FIELD ")"
LOGIC_OP :: = "opt" | "alt" | "one_of" | "some_of"
```





## LINE 语法



```
LINE :: =  “RULE” RULE_NAME "{" [LINE_PIPE] *GROUP  "}"
LINE_PIPE:: = "|" PIPE_FUN "|"
PIPE_FUN :: = "base64" |  "esc_quato" |...
```
