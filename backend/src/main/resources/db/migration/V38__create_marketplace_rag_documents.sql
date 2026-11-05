CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS marketplace_rag_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id UUID NULL,
    type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    content TEXT NOT NULL,
    url TEXT,
    source_table VARCHAR(100) NOT NULL,
    embedding vector(384),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_rag_documents_type
    ON marketplace_rag_documents (type);

CREATE INDEX IF NOT EXISTS idx_marketplace_rag_documents_source_table
    ON marketplace_rag_documents (source_table);

CREATE INDEX IF NOT EXISTS idx_marketplace_rag_documents_created_at
    ON marketplace_rag_documents (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketplace_rag_documents_embedding
    ON marketplace_rag_documents USING hnsw (embedding vector_cosine_ops);
