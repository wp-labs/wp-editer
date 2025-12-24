use sea_orm_migration::prelude::*;
use sea_orm::{Schema, DbBackend};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let schema = Schema::new(DbBackend::Postgres);

        // 创建 knowledge_configs 表
        let stmt = schema.create_table_from_entity(crate::entity::knowledge_config::Entity);
        manager.create_table(stmt).await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // 删除表（按相反顺序，先删除有外键的表）
        manager.drop_table(Table::drop().table(crate::entity::knowledge_config::Entity).to_owned()).await?;
        Ok(())
    }
}
