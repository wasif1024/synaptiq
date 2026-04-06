use axum::{extract::{Path, State}, Json};
use axum::http::StatusCode;
use sqlx::MySqlPool;
use crate::models::*;
use crate::errors::AppError;

pub async fn list_agents(State(pool): State<MySqlPool>) -> Result<Json<Vec<Agent>>, AppError> {
    let agents = sqlx::query_as::<_, Agent>("SELECT * FROM agents ORDER BY created_at DESC")
        .fetch_all(&pool).await?;
    Ok(Json(agents))
}

pub async fn get_agent(State(pool): State<MySqlPool>, Path(id): Path<i32>) -> Result<Json<Agent>, AppError> {
    let agent = sqlx::query_as::<_, Agent>("SELECT * FROM agents WHERE id = ?")
        .bind(id).fetch_one(&pool).await?;
    Ok(Json(agent))
}

pub async fn create_agent(State(pool): State<MySqlPool>, Json(body): Json<CreateAgent>) -> Result<(StatusCode, Json<Agent>), AppError> {
    let model = body.model.unwrap_or_else(|| "claude-3-5-sonnet-latest".into());
    sqlx::query("INSERT INTO agents (name, description, system_prompt, model, tools) VALUES (?, ?, ?, ?, ?)")
        .bind(&body.name).bind(&body.description).bind(&body.system_prompt).bind(&model).bind(&body.tools)
        .execute(&pool).await?;
    let agent = sqlx::query_as::<_, Agent>("SELECT * FROM agents ORDER BY id DESC LIMIT 1")
        .fetch_one(&pool).await?;
    Ok((StatusCode::CREATED, Json(agent)))
}

pub async fn update_agent(State(pool): State<MySqlPool>, Path(id): Path<i32>, Json(body): Json<UpdateAgent>) -> Result<Json<Agent>, AppError> {
    let existing = sqlx::query_as::<_, Agent>("SELECT * FROM agents WHERE id = ?")
        .bind(id).fetch_one(&pool).await?;
    let name = body.name.unwrap_or(existing.name);
    let desc = body.description.or(existing.description);
    let prompt = body.system_prompt.unwrap_or(existing.system_prompt);
    let model = body.model.unwrap_or(existing.model);
    let tools = body.tools.or(existing.tools);
    sqlx::query("UPDATE agents SET name=?, description=?, system_prompt=?, model=?, tools=? WHERE id=?")
        .bind(&name).bind(&desc).bind(&prompt).bind(&model).bind(&tools).bind(id)
        .execute(&pool).await?;
    let agent = sqlx::query_as::<_, Agent>("SELECT * FROM agents WHERE id = ?")
        .bind(id).fetch_one(&pool).await?;
    Ok(Json(agent))
}

pub async fn delete_agent(State(pool): State<MySqlPool>, Path(id): Path<i32>) -> Result<StatusCode, AppError> {
    sqlx::query("DELETE FROM agents WHERE id = ?").bind(id).execute(&pool).await?;
    Ok(StatusCode::NO_CONTENT)
}