use sqlx::MySqlPool;

pub async fn run(pool: &MySqlPool) -> Result<(), Box<dyn std::error::Error>> {
    let existing = sqlx::query_as::<_, (i32,)>("SELECT id FROM agents LIMIT 1")
        .fetch_optional(pool).await?;
    if existing.is_some() {
        tracing::info!("Already seeded");
        return Ok(());
    }

    sqlx::query("INSERT INTO agents (name, description, system_prompt, model) VALUES (?, ?, ?, ?)")
        .bind("General Assistant")
        .bind("A versatile AI assistant for general questions and tasks")
        .bind("You are Synaptiq, an intelligent AI assistant created by Myndlab. You are helpful, accurate, and friendly. Provide clear and concise answers.")
        .bind("claude-3-5-sonnet-latest")
        .execute(pool).await?;

    sqlx::query("INSERT INTO agents (name, description, system_prompt, model) VALUES (?, ?, ?, ?)")
        .bind("Code Expert")
        .bind("Specialized in programming and software development")
        .bind("You are a senior software engineer AI. Help users with coding questions, debugging, code review, and architecture decisions. Provide code examples when helpful.")
        .bind("claude-3-5-sonnet-latest")
        .execute(pool).await?;

    sqlx::query("INSERT INTO agents (name, description, system_prompt, model) VALUES (?, ?, ?, ?)")
        .bind("Creative Writer")
        .bind("Helps with creative writing, copywriting, and content creation")
        .bind("You are a creative writing assistant. Help users craft compelling stories, marketing copy, blog posts, and other creative content. Be imaginative and engaging.")
        .bind("claude-3-5-sonnet-latest")
        .execute(pool).await?;

    sqlx::query("INSERT INTO agents (name, description, system_prompt, model) VALUES (?, ?, ?, ?)")
        .bind("Research Analyst")
        .bind("Deep research and analysis on complex topics")
        .bind("You are a research analyst AI. Provide thorough, well-structured analysis on topics. Cite reasoning, consider multiple perspectives, and present findings clearly.")
        .bind("claude-3-5-sonnet-latest")
        .execute(pool).await?;

    // Create sample conversations
    sqlx::query("INSERT INTO conversations (title, agent_id) VALUES (?, 1)")
        .bind("Getting started with Synaptiq")
        .execute(pool).await?;

    sqlx::query("INSERT INTO messages (conversation_id, role, content) VALUES (1, 'user', 'Hello! What can you help me with?')")
        .execute(pool).await?;
    sqlx::query("INSERT INTO messages (conversation_id, role, content) VALUES (1, 'assistant', 'Hello! I\\'m Synaptiq, your AI assistant by Myndlab. I can help you with general questions, research, coding, creative writing, and much more. What would you like to explore today?')")
        .execute(pool).await?;

    // Knowledge base
    sqlx::query("INSERT INTO knowledge_bases (name, description) VALUES (?, ?)")
        .bind("Company Docs")
        .bind("Internal company documentation and policies")
        .execute(pool).await?;

    tracing::info!("Seed data inserted successfully");
    Ok(())
}