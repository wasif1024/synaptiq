mod config;
mod db;
mod models;
mod errors;
mod handlers;
mod seed;

use axum::{Router, routing::{get, post, delete}};
use tower_http::cors::{CorsLayer, AllowOrigin};
use axum::http::{Method, header};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();
    let _ = dotenvy::dotenv();

    let config = config::Config::from_env().map_err(|e| format!("Config error: {e}"))?;
    let pool = db::create_pool(&config).await?;

    // Run seed
    if let Err(e) = seed::run(&pool).await {
        tracing::warn!("Seed error (non-fatal): {}", e);
    }

    let origins: Vec<axum::http::HeaderValue> = config.cors_origins.iter()
        .filter_map(|o| o.parse().ok())
        .collect();

    let cors = CorsLayer::new()
        .allow_origin(AllowOrigin::list(origins))
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::OPTIONS])
        .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION]);

    let app = Router::new()
        .route("/health", get(|| async { "ok" }))
        .route("/api/health", get(|| async { "ok" }))
        .route("/api/agents", get(handlers::agents::list_agents).post(handlers::agents::create_agent))
        .route("/api/agents/{id}", get(handlers::agents::get_agent).put(handlers::agents::update_agent).delete(handlers::agents::delete_agent))
        .route("/api/conversations", get(handlers::conversations::list_conversations).post(handlers::conversations::create_conversation))
        .route("/api/conversations/{id}", get(handlers::conversations::get_conversation).delete(handlers::conversations::delete_conversation))
        .route("/api/conversations/{id}/messages", get(handlers::conversations::get_messages))
        .route("/api/conversations/{id}/chat", post(handlers::chat::chat))
        .route("/api/knowledge", get(handlers::knowledge::list_knowledge_bases).post(handlers::knowledge::create_knowledge_base))
        .route("/api/knowledge/{id}/documents", get(handlers::knowledge::list_documents).post(handlers::knowledge::create_document))
        .route("/api/knowledge/{kb_id}/documents/{doc_id}", delete(handlers::knowledge::delete_document))
        .layer(cors)
        .with_state(pool);

    let addr = format!("0.0.0.0:{}", config.port);
    tracing::info!("Server listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}