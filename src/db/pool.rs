// 数据库连接池抽象

use crate::error::DbResult;
use sea_orm::{ConnectOptions, Database, DatabaseConnection};
use std::time::Duration;

#[derive(Clone)]
pub struct DbPool {
    conn: DatabaseConnection,
}

impl DbPool {
    pub async fn new(
        database_url: &str,
        max_connections: u32,
        _min_connections: u32,
    ) -> DbResult<Self> {
        let mut opt = ConnectOptions::new(database_url.to_string());
        opt.max_connections(max_connections)
            .connect_timeout(Duration::from_secs(30))
            .idle_timeout(Duration::from_secs(600))
            .sqlx_logging(false);

        let conn = Database::connect(opt).await?;
        Ok(Self { conn })
    }

    pub fn inner(&self) -> &DatabaseConnection {
        &self.conn
    }

    pub async fn test_connection(&self) -> DbResult<()> {
        self.conn.ping().await?;
        Ok(())
    }
}
