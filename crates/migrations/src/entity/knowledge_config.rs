use sea_orm::entity::prelude::*;
use sea_orm_migration::seaql_migrations::Relation;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[derive(DeriveEntityModel)]
#[sea_orm(table_name = "knowledge_configs")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub file_name: String,
    pub config_content: Option<String>,
    pub create_sql: Option<String>,
    pub insert_sql: Option<String>,
    pub data_content: Option<String>,
    pub is_active: bool,
    pub updated_at: DateTimeUtc,
    pub created_at: DateTimeUtc,
}

impl ActiveModelBehavior for ActiveModel {}
