use backend::config;
use backend::db;
use backend::seed;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();
    let _ = dotenvy::dotenv();
    let cfg = config::Config::from_env().map_err(|e| format!("Config: {e}"))?;
    let pool = db::create_pool(&cfg).await?;
    seed::run(&pool).await?;
    Ok(())
}