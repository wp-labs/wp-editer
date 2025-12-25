FROM docker.cnb.cool/dy-sec/s-devkit/rust-cicd:0.7.1  AS builder

WORKDIR /usr/src/app

# 复制源代码（包含.cargo/config）
COPY . .

ARG CI_DOCKER_PWD
ENV CI_DOCKER_PWD=${CI_DOCKER_PWD}
RUN git config --global url."https://cnb:${CI_DOCKER_PWD}@cnb.cool/".insteadOf "https://cnb.cool/"

RUN cargo build --release
 
FROM ubuntu:24.04

RUN apt-get update && \
    apt-get install -y libsqlite3-0 && \
    rm -rf /var/lib/apt/lists/*

# 创建非root用户
RUN groupadd -r appgroup && useradd -r -g appgroup appuser 
WORKDIR /app

# 从构建阶段拷贝二进制文件
COPY --from=builder /usr/src/app/target/release/wp-editor /app/wp-editor
COPY --from=builder /usr/src/app/template /app/template
COPY --from=builder /usr/src/app/web/dist /app/web/dist

# 设置权限
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080
CMD ["/app/wp-editor"]