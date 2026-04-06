use axum::{extract::{Path, State}, Json};
use sqlx::MySqlPool;
use crate::models::*;
use crate::errors::AppError;

pub async fn chat(
    State(pool): State<MySqlPool>,
    Path(id): Path<i32>,
    Json(body): Json<ChatMessage>,
) -> Result<Json<Message>, AppError> {
    // Save user message
    sqlx::query("INSERT INTO messages (conversation_id, role, content) VALUES (?, 'user', ?)")
        .bind(id).bind(&body.content)
        .execute(&pool).await?;

    // Get agent for this conversation
    let convo = sqlx::query_as::<_, Conversation>("SELECT * FROM conversations WHERE id = ?")
        .bind(id).fetch_one(&pool).await?;
    let agent = sqlx::query_as::<_, Agent>("SELECT * FROM agents WHERE id = ?")
        .bind(convo.agent_id).fetch_one(&pool).await?;

    // Get conversation history
    let history = sqlx::query_as::<_, Message>(
        "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC"
    ).bind(id).fetch_all(&pool).await?;

    // Build messages array for Anthropic API
    let messages: Vec<serde_json::Value> = history.iter().map(|msg| {
        serde_json::json!({
            "role": if msg.role == "user" { "user" } else { "assistant" },
            "content": msg.content
        })
    }).collect();

    // Call Anthropic API
    let api_key = std::env::var("ANTHROPIC_API_KEY").unwrap_or_default();
    let ai_response = if api_key.is_empty() {
        "I'm Synaptiq, your AI assistant powered by Myndlab. The ANTHROPIC_API_KEY is not configured yet. Please add it in Settings to enable AI responses.".to_string()
    } else {
        call_anthropic(&api_key, &agent.system_prompt, &agent.model, &messages).await
            .unwrap_or_else(|e| format!("Error calling AI: {e}"))
    };

    // Save assistant message
    sqlx::query("INSERT INTO messages (conversation_id, role, content) VALUES (?, 'assistant', ?)")
        .bind(id).bind(&ai_response)
        .execute(&pool).await?;

    // Update conversation timestamp
    sqlx::query("UPDATE conversations SET updated_at = NOW() WHERE id = ?")
        .bind(id).execute(&pool).await?;

    let msg = sqlx::query_as::<_, Message>("SELECT * FROM messages WHERE conversation_id = ? ORDER BY id DESC LIMIT 1")
        .bind(id).fetch_one(&pool).await?;

    Ok(Json(msg))
}

async fn call_anthropic(
    api_key: &str,
    system_prompt: &str,
    model: &str,
    messages: &[serde_json::Value],
) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
    let client = reqwest::Client::new();
    let body = serde_json::json!({
        "model": model,
        "max_tokens": 4096,
        "system": system_prompt,
        "messages": messages
    });

    let resp = client
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", api_key)
        .header("anthropic-version", "2023-06-01")
        .header("content-type", "application/json")
        .json(&body)
        .send()
        .await?;

    if !resp.status().is_success() {
        let status = resp.status();
        let text = resp.text().await.unwrap_or_default();
        return Err(format!("Anthropic API error {status}: {text}").into());
    }

    let json: serde_json::Value = resp.json().await?;
    let content = json["content"]
        .as_array()
        .and_then(|arr| arr.first())
        .and_then(|block| block["text"].as_str())
        .unwrap_or("No response from AI")
        .to_string();

    Ok(content)
}