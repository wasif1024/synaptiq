use crate::config::Config;
use sqlx::MySqlPool;

pub async fn bootstrap(config: &Config) -> Result<MySqlPool, Box<dyn std::error::Error>> {
    let ssl_mode = if config.mysql_ssl { "?ssl-mode=required" } else { "" };
    let base_url = format!(
        "mysql://{}:{}@{}:{}{}",
        config.mysql_user, config.mysql_password, config.mysql_host, config.mysql_port, ssl_mode
    );
    let base_pool = MySqlPool::connect(&base_url).await?;
    sqlx::query(&format!("CREATE DATABASE IF NOT EXISTS `{}`", config.mysql_db))
        .execute(&base_pool).await?;
    base_pool.close().await;

    let db_url = format!(
        "mysql://{}:{}@{}:{}/{}{}",
        config.mysql_user, config.mysql_password, config.mysql_host, config.mysql_port, config.mysql_db, ssl_mode
    );
    let pool = MySqlPool::connect(&db_url).await?;
    run_migrations(&pool).await?;
    Ok(pool)
}

pub async fn run_migrations(pool: &MySqlPool) -> Result<(), Box<dyn std::error::Error>> {
    sqlx::migrate!("./migrations").run(pool).await?;
    Ok(())
}