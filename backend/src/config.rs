#[derive(Clone, Debug)]
pub struct Config {
    pub port: u16,
    pub mysql_host: String,
    pub mysql_port: u16,
    pub mysql_user: String,
    pub mysql_password: String,
    pub mysql_db: String,
    pub mysql_ssl: bool,
    pub cors_origins: Vec<String>,
}

impl Config {
    pub fn from_env() -> Result<Self, String> {
        Ok(Self {
            port: std::env::var("PORT").unwrap_or_else(|_| "8080".into()).parse().map_err(|e| format!("PORT: {e}"))?,
            mysql_host: std::env::var("MYSQL_HOST").unwrap_or_else(|_| "localhost".into()),
            mysql_port: std::env::var("MYSQL_PORT").unwrap_or_else(|_| "3306".into()).parse().map_err(|e| format!("MYSQL_PORT: {e}"))?,
            mysql_user: std::env::var("MYSQL_USER").unwrap_or_else(|_| "root".into()),
            mysql_password: std::env::var("MYSQL_PASSWORD").unwrap_or_else(|_| "root".into()),
            mysql_db: std::env::var("MYSQL_DB").unwrap_or_else(|_| "synaptiq_64cc5b17".into()),
            mysql_ssl: std::env::var("MYSQL_SSL").unwrap_or_default() == "true",
            cors_origins: std::env::var("CORS_ALLOWED_ORIGINS")
                .unwrap_or_else(|_| "http://localhost:4000,http://localhost:3000".into())
                .split(',').map(|s| s.trim().to_string()).collect(),
        })
    }
}