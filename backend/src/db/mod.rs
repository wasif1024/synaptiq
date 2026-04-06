pub mod bootstrap;

use crate::config::Config;
use sqlx::MySqlPool;

pub async fn create_pool(config: &Config) -> Result<MySqlPool, Box<dyn std::error::Error>> {
    bootstrap::bootstrap(config).await
}