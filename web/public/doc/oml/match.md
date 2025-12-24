# Match



## 单值判定

示例

```
src_city  =  match read(ip) {
        (ip(10.0.0.1), ip(10.0.0.10)) => read(city1) ;
        ip(10.0.10.1)  => read(city2) ;
        _  => chars(bj) ;
};
```
数据:
```protobuf

ip : "10.0.0.3" , city1 : "cs" , city2 : "hk" 

```

## 双值判定

```
level  = match  ( read(city) , read(count) ) {
   ( chars(cs) , in ( digit(81) ,  digit(200) ) )    => chars(GOOD);
   ( chars(cs) , in ( digit(0) ,   digit(80) )  )   => chars(BAD);
   ( chars(bj) , in ( digit(101) , digit(200) ) )   => chars(GOOD);
   ( chars(bj) , in ( digit(0) ,   digit(100) ) )   => chars(BAD);
    _ => chars(NOR);
};
```





示例

```

quart   = match  read(month) {
    in ( digit(1) , digit(3) )    => chars(Q1);
    in ( digit(4) , digit(6) )    => chars(Q2);
    in ( digit(7) , digit(9) )    => chars(Q3);
    in ( digit(10) , digit(12) )  => chars(Q4);
    _ => chars(Q5);
};

month = take();

level  = match  ( read(city) , read(count) ) {
   ( chars(cs) , in ( digit(81) ,  digit(200) ) )    => chars(GOOD);
   ( chars(cs) , in ( digit(0) ,   digit(80) )  )   => chars(BAD);
   ( chars(bj) , in ( digit(101) , digit(200) ) )   => chars(GOOD);
   ( chars(bj) , in ( digit(0) ,   digit(100) ) )   => chars(BAD);
    _ => chars(NOR);
};

vender = match  read(product)  {
    chars(dayu)   =>   chars(dayu-rd)
    !chars(dayu)   =>  chars(other)
};
```