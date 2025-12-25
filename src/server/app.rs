// 应用启动逻辑

use crate::{api, server::Setting};
use actix_web::{App, HttpRequest, HttpResponse, HttpServer, Result, middleware::Logger, web};
use mime_guess::from_path;
use rust_embed::RustEmbed;
use std::sync::Arc;
use tokio::sync::Mutex;
use wp_model_core::model::DataRecord;

// SharedRecord 类型定义
pub type SharedRecord = Arc<Mutex<Option<DataRecord>>>;

#[derive(RustEmbed)]
#[folder = "web/dist"]
struct WebAssets;

// 处理静态资源
async fn static_files(req: HttpRequest) -> Result<HttpResponse> {
    let mut path = req.path().trim_start_matches('/');

    if path.is_empty() {
        path = "index.html";
    }

    if let Some(file) = WebAssets::get(path) {
        let mime = from_path(path).first_or_octet_stream();
        Ok(HttpResponse::Ok()
            .content_type(mime.as_ref())
            .body(file.data.to_vec()))
    } else if let Some(index) = WebAssets::get("index.html") {
        Ok(HttpResponse::Ok()
            .content_type("text/html; charset=utf-8")
            .body(index.data.to_vec()))
    } else {
        Err(actix_web::error::ErrorNotFound("File not found"))
    }
}

pub async fn start() -> std::io::Result<()> {
    let setting = Setting::load();
    simple_log::quick!(&setting.log.level);

    info!("启动 WpEditor 服务器");
    info!("Web 地址: {}:{}", setting.web.host, setting.web.port);

    // 创建并注入 SharedRecord
    let shared_record: SharedRecord = Arc::new(Mutex::new(None));
    let shared_record_data = web::Data::new(shared_record);

    HttpServer::new(move || {
        App::new()
            // HTTP 请求访问日志：使用默认格式，并排除常见前端路由和静态资源，只保留 /api/... 日志
            .wrap(
                Logger::default()
                    .exclude("/simulate-debug")
                    .exclude("/favicon.ico")
                    .exclude_regex("^/assets/"),
            )
            .app_data(shared_record_data.clone())
            // 系统 API
            .service(api::get_version)
            // 调试 API
            .service(api::debug_parse)
            .service(api::debug_transform)
            // 默认路由：未匹配的 /api/* 返回 JSON 404，其余走静态文件（前端 SPA）
            .default_service(web::to(|req: HttpRequest| async move {
                if req.path().starts_with("/api/") {
                    HttpResponse::NotFound().json(serde_json::json!({
                        "success": false,
                        "error": {
                            "code": "NOT_FOUND",
                            "message": format!("API {} 不存在", req.path()),
                            "details": serde_json::json!({ "path": req.path() })
                        }
                    }))
                } else {
                    static_files(req).await.unwrap()
                }
            }))
    })
    .bind((setting.web.host.as_str(), setting.web.port))?
    .run()
    .await
}
