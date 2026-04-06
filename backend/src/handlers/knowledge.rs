use axum::{extract::{Path, State}, Json};
use axum::http::StatusCode;
use sqlx::MySqlPool;
use crate::models::*;
use crate::errors::AppError;

pub async fn list_knowledge_bases(State(pool): State<MySqlPool>) -> Result<Json<Vec<KnowledgeBase>>, AppError> {
    let kbs = sqlx::query_as::<_, KnowledgeBase>("SELECT * FROM knowledge_bases ORDER BY created_at DESC")
        .fetch_all(&pool).await?;
    Ok(Json(kbs))
}

pub async fn create_knowledge_base(State(pool): State<MySqlPool>, Json(body): Json<CreateKnowledgeBase>) -> Result<(StatusCode, Json<KnowledgeBase>), AppError> {
    sqlx::query("INSERT INTO knowledge_bases (name, description) VALUES (?, ?)")
        .bind(&body.name).bind(&body.description)
        .execute(&pool).await?;
    let kb = sqlx::query_as::<_, KnowledgeBase>("SELECT * FROM knowledge_bases ORDER BY id DESC LIMIT 1")
        .fetch_one(&pool).await?;
    Ok((StatusCode::CREATED, Json(kb)))
}

pub async fn list_documents(State(pool): State<MySqlPool>, Path(id): Path<i32>) -> Result<Json<Vec<Document>>, AppError> {
    let docs = sqlx::query_as::<_, Document>("SELECT * FROM documents WHERE knowledge_base_id = ? ORDER BY created_at DESC")
        .bind(id).fetch_all(&pool).await?;
    Ok(Json(docs))
}

pub async fn create_document(State(pool): State<MySqlPool>, Path(id): Path<i32>, Json(body): Json<CreateDocument>) -> Result<(StatusCode, Json<Document>), AppError> {
    sqlx::query("INSERT INTO documents (knowledge_base_id, filename, content, file_type) VALUES (?, ?, ?, ?)")
        .bind(id).bind(&body.filename).bind(&body.content).bind(&body.file_type)
        .execute(&pool).await?;
    let doc = sqlx::query_as::<_, Document>("SELECT * FROM documents ORDER BY id DESC LIMIT 1")
        .fetch_one(&pool).await?;
    Ok((StatusCode::CREATED, Json(doc)))
}

pub async fn delete_document(State(pool): State<MySqlPool>, Path((kb_id, doc_id)): Path<(i32, i32)>) -> Result<StatusCode, AppError> {
    sqlx::query("DELETE FROM documents WHERE id = ? AND knowledge_base_id = ?")
        .bind(doc_id).bind(kb_id).execute(&pool).await?;
    Ok(StatusCode::NO_CONTENT)
}