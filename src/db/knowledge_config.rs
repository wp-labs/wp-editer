// 知识库配置仓储

use crate::error::{DbError, DbResult};
use chrono::Utc;
use sea_orm::{DatabaseConnection, QueryOrder, Set, entity::prelude::*};
use serde::{Deserialize, Serialize};
use wp_editer_migrations::entity::knowledge_config::{ActiveModel, Column, Entity, Model};

pub type KnowledgeConfig = Model;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewKnowledgeConfig {
    pub file_name: String,
    pub config_content: Option<String>,
    pub create_sql: Option<String>,
    pub insert_sql: Option<String>,
    pub data_content: Option<String>,
}

pub struct KnowledgeConfigRepo<'a> {
    db: &'a DatabaseConnection,
}

impl<'a> KnowledgeConfigRepo<'a> {
    pub fn new(db: &'a DatabaseConnection) -> Self {
        Self { db }
    }

    pub async fn find_all(&self) -> DbResult<Vec<KnowledgeConfig>> {
        let configs = Entity::find()
            .order_by_desc(Column::CreatedAt)
            .all(self.db)
            .await?;
        Ok(configs)
    }

    pub async fn find_by_file_name(&self, file_name: &str) -> DbResult<Option<KnowledgeConfig>> {
        let config = Entity::find()
            .filter(Column::FileName.eq(file_name))
            .one(self.db)
            .await?;
        Ok(config)
    }

    pub async fn create(&self, config: NewKnowledgeConfig) -> DbResult<i32> {
        let now = Utc::now();
        let active_model = ActiveModel {
            file_name: Set(config.file_name),
            config_content: Set(config.config_content),
            create_sql: Set(config.create_sql),
            insert_sql: Set(config.insert_sql),
            data_content: Set(config.data_content),
            is_active: Set(true),
            updated_at: Set(now),
            created_at: Set(now),
            ..Default::default()
        };
        let result = Entity::insert(active_model).exec(self.db).await?;
        Ok(result.last_insert_id)
    }

    pub async fn update(&self, file_name: &str, config: NewKnowledgeConfig) -> DbResult<()> {
        let model = Entity::find()
            .filter(Column::FileName.eq(file_name))
            .one(self.db)
            .await?
            .ok_or(DbError::not_found("知识库配置"))?;

        let mut active_model: ActiveModel = model.into();
        active_model.config_content = Set(config.config_content);
        active_model.create_sql = Set(config.create_sql);
        active_model.insert_sql = Set(config.insert_sql);
        active_model.data_content = Set(config.data_content);
        active_model.updated_at = Set(Utc::now());
        active_model.update(self.db).await?;
        Ok(())
    }

    pub async fn update_active(&self, file_name: &str, is_active: bool) -> DbResult<()> {
        let model = Entity::find()
            .filter(Column::FileName.eq(file_name))
            .one(self.db)
            .await?
            .ok_or(DbError::not_found("知识库配置"))?;

        let mut active_model: ActiveModel = model.into();
        active_model.is_active = Set(is_active);
        active_model.updated_at = Set(Utc::now());
        active_model.update(self.db).await?;
        Ok(())
    }

    pub async fn get_status_list(&self) -> DbResult<Vec<(String, bool)>> {
        // 只返回处于激活状态的配置，保持与 wpl/oml 一致的行为
        let configs = Entity::find()
            .filter(Column::IsActive.eq(true))
            .order_by_asc(Column::FileName)
            .all(self.db)
            .await?;

        Ok(configs
            .into_iter()
            .map(|c| (c.file_name, c.is_active))
            .collect())
    }

    pub async fn delete_by_file_name(&self, file_name: &str) -> DbResult<()> {
        Entity::delete_many()
            .filter(Column::FileName.eq(file_name))
            .exec(self.db)
            .await?;
        Ok(())
    }
}
