# 下载


## 执行程序
需要 AF的帐号

* [alpha-list](https://af-biz.qianxin-inc.cn/artifactory/qianxin-generic-alpha-dayu/dvron)
* [beta-list](https://af-biz.qianxin-inc.cn/artifactory/qianxin-generic-beta-dayu/dvron)
* [release-list](https://af-biz.qianxin-inc.cn/artifactory/qianxin-generic-release-dayu/dvron)


## docker(当前仅有x86架构)

- 大禹k8s环境下跑的最小镜像
```shell
docker pull qianxin-docker-beta-dayu.af-biz.qianxin-inc.cn/dvron:0.7.3-beta2.single 
```
- 单独启动的镜像，下面启动方式二选一


  **1、通过docker-compose启动项目：**

  docker-compose.yaml文件
  ```yaml
  version: '3'
  services:
    dyvrn:
      restart: always
      image: qianxin-docker-beta-dayu.af-biz.qianxin-inc.cn/dvron:0.7.3-beta2.single 
      container_name: dyvrn
      volumes:
        - ./conf/:/app/conf/
        - ./ldm/:/app/ldm/  
        - ./sink/:/app/sink/  
        - ./logs/:/app/logs/ 
        - ./rescue/:/app/rescue/
        - /out:/app/out 
  
  ```

[docker-compose git](https://git-open.qianxin-inc.cn/org/dayu/dvron-docker)

[下载 docker-compse 文件](https://git-open.qianxin-inc.cn/org/dayu/dvron-docker/-/archive/master/dvron-docker-master.tar.gz)

