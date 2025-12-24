// 知识库 API
use crate::db::{knowledge_config::KnowledgeConfigRepo, pool::DbPool};
use crate::error::AppError;
use actix_web::{HttpResponse, get, post, web};
use serde::{Deserialize, Serialize};
use wp_knowledge::facade::query as query_all;

// 查询知识库（数据库）列表：从 knowledge_configs 表读取所有配置
#[get("/api/db_list")]
pub async fn get_db_list(pool: web::Data<DbPool>) -> Result<HttpResponse, AppError> {
    let db = pool.inner();
    let repo = KnowledgeConfigRepo::new(db);

    let configs = repo.find_all().await?;
    let names: Vec<String> = configs.into_iter().map(|c| c.file_name).collect();
    info!("查询知识库列表成功: {:?}", names);

    Ok(HttpResponse::Ok().json(names))
}

#[derive(Serialize, Deserialize)]
pub struct KnowdbQuery {
    pub sql: String,
}

// 执行知识库 SQL 查询（旧实现，返回自定义 JSON 格式）
#[post("/api/db")]
pub async fn query(req: web::Json<KnowdbQuery>) -> Result<HttpResponse, AppError> {
    let req = req.into_inner();

    let response = match query_all(&req.sql) {
        Ok(result) => HttpResponse::Ok().json(&result),
        Err(err) => {
            error!("查询知识库失败: {}", err);
            HttpResponse::BadRequest()
                .content_type("application/json")
                .body(err.to_string())
        }
    };

    Ok(response)
}
