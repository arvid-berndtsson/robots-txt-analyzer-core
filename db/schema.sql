-- Analysis results cache (temporary storage)
CREATE TABLE IF NOT EXISTS cache (
    domain TEXT PRIMARY KEY,
    result TEXT NOT NULL,
    timestamp DATETIME NOT NULL
);

-- Analysis history (permanent record)
CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain TEXT NOT NULL,
    url TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    is_real BOOLEAN NOT NULL DEFAULT 1
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_timestamp ON analyses(timestamp);
CREATE INDEX IF NOT EXISTS idx_domain ON analyses(domain); 