use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use serde_json::json;

pub struct AppError(pub Box<dyn std::error::Error + Send + Sync>);

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        tracing::error!("Error: {}", self.0);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            axum::Json(json!({"success": false, "error": {"message": self.0.to_string()}})),
        ).into_response()
    }
}

impl<E: std::error::Error + Send + Sync + 'static> From<E> for AppError {
    fn from(e: E) -> Self {
        AppError(Box::new(e))
    }
}