use wp_editer::server::start;

#[tokio::main]
async fn main() {
    start().await.expect("启动服务器失败");
}
