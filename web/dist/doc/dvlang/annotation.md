# 注解



## 示例: 

### 作用到 rule

```
#[tag(tag_1: "x", tag_2: "y")]
rule sky_eye {
...
}
```

```
#[copy_raw(name:"raw")]
rule sky_eye {
...
}
```


```
#[tag(tag_1: "x", tag_2: "y"),copy_raw(name:"raw")]
rule sky_eye {
...
}
```

### 作用到 package
```rust
#[tag(tag_1: "x", tag_2: "y"),copy_raw(name:"raw")]
package net_traffic  {
  rule sky_eye {
  ...
  }
}
```
作用到package 的注解, 全部生效到rule上.

### 同时作用

#### 规则:

* 合并: package 的注解能力与rule 的注解能力合并
* 冲突: 最小作用优先.  rule   > package   

#### 合并示例

```rust
#[copy_raw(name:"raw")]
package net_traffic  {
  #[tag(tag_1: "x", tag_2: "y")]
  rule sky_eye {
  ...
  }
}
```

#### 优先示例

```rust
#[tag(tag_1: "x1", tag_2: "y2")]
package net_traffic  {
  #[tag(tag_1: "x3", tag_3: "y4")]
  rule sky_eye {
  ...
  }
}
```
**结果:**

数据最后结果:

```
tag_1: "x3", tag_2 : "y2", tag_3: "y4"
```



## 注解能力

###  标签

#### 语法:

```rust
#[tag(tag_name : "tag_val",...)]
```

#### 作用:

给分析后的数据,打上设置多个标签, 

### 复制原数据

#### 语法:

```
#[copy_raw(name:"raw")]
```

#### 作用:

把原始的数据 copy 到设置的字段内.



