use axum::{extract::{Path, State}, Json};
use axum::http::StatusCode;
use sqlx::MySqlPool;
use crate::models::*;
use crate::errors::AppError;

pub async fn list_conversations(State(pool): State<MySqlPool>) -> Result<Json<Vec<Conversation>>, AppError> {
    let convos = sqlx::query_as::<_, Conversation>("SELECT * FROM conversations ORDER BY updated_at DESC")
        .fetch_all(&pool).await?;
    Ok(Json(convos))
}

pub async fn get_conversation(State(pool): State<MySqlPool>, Path(id): Path<i32>) -> Result<Json<Conversation>, AppError> {
    let convo = sqlx::query_as::<_, Conversation>("SELECT * FROM conversations WHERE id = ?")
        .bind(id).fetch_one(&pool).await?;
    Ok(Json(convo))
}

pub async fn create_conversation(State(pool): State<MySqlPool>, Json(body): Json<CreateConversation>) -> Result<(StatusCode, Json<Conversation>), AppError> {
    let title = body.title.unwrap_or_else(|| "New Chat".into());
    sqlx::query("INSERT INTO conversations (title, agent_id) VALUES (?, ?)")
        .bind(&title).bind(body.agent_id)
        .execute(&pool).await?;
    let convo = sqlx::query_as::<_, Conversation>("SELECT * FROM conversations ORDER BY id DESC LIMIT 1")
        .fetch_one(&pool).await?;
    Ok((StatusCode::CREATED, Json(convo)))
}

pub async fn delete_conversation(State(pool): State<MySqlPool>, Path(id): Path<i32>) -> Result<StatusCode, AppError> {
    sqlx::query("DELETE FROM messages WHERE conversation_id = ?").bind(id).execute(&pool).await?;
    sqlx::query("DELETE FROM conversations WHERE id = ?").bind(id).execute(&pool).await?;
    Ok(StatusCode::NO_CONTENT)
}

pub async fn get_messages(State(pool): State<MySqlPool>, Path(id): Path<i32>) -> Result<Json<Vec<Message>>, AppError> {
    let msgs = sqlx::query_as::<_, Message>("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC")
        .bind(id).fetch_all(&pool).await?;
    Ok(Json(msgs))
}