-- Token1000 Database Schema
-- PostgreSQL with Supabase compatibility

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROVIDERS TABLE
-- ============================================
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,  -- URL-friendly ID (e.g., 'siliconflow')
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    affiliate_url VARCHAR(500),           -- Affiliate tracking link
    models TEXT[] NOT NULL DEFAULT '{}',  -- Array of supported models
    description TEXT,
    features TEXT[] DEFAULT '{}',

    -- Ratings (1-5 scale)
    stability INTEGER CHECK (stability >= 1 AND stability <= 5),
    speed INTEGER CHECK (speed >= 1 AND speed <= 5),
    rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),

    -- Risk assessment
    risk_level VARCHAR(20) DEFAULT 'unknown'
        CHECK (risk_level IN ('safe', 'watch', 'danger', 'unknown')),
    tier VARCHAR(20) DEFAULT 'standard'
        CHECK (tier IN ('recommended', 'standard', 'suspicious')),
    risk_note TEXT,

    -- Data verification
    data_verified BOOLEAN DEFAULT FALSE,
    last_verified DATE,
    data_source VARCHAR(20) DEFAULT 'community'
        CHECK (data_source IN ('official', 'automated', 'verified', 'community')),

    -- User feedback
    review_count INTEGER DEFAULT 0,
    recent_feedback TEXT,

    -- Status tracking
    status VARCHAR(20) DEFAULT 'unverified'
        CHECK (status IN ('online', 'offline', 'degraded', 'unverified')),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for providers
CREATE INDEX idx_providers_slug ON providers(slug);
CREATE INDEX idx_providers_risk_level ON providers(risk_level);
CREATE INDEX idx_providers_tier ON providers(tier);
CREATE INDEX idx_providers_status ON providers(status);
CREATE INDEX idx_providers_data_source ON providers(data_source);

-- ============================================
-- PRICING TABLE
-- ============================================
CREATE TABLE provider_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,

    -- Model identifier (normalized)
    model_key VARCHAR(100) NOT NULL,  -- e.g., 'gpt-4o', 'deepseek-v3'
    model_display_name VARCHAR(100), -- e.g., 'GPT-4o', 'DeepSeek-V3'

    -- Pricing (per 1M tokens)
    input_price DECIMAL(10,4),       -- CNY per 1M input tokens
    output_price DECIMAL(10,4),      -- CNY per 1M output tokens

    -- Verification
    is_current BOOLEAN DEFAULT TRUE,  -- Only latest price is current
    data_source VARCHAR(20) DEFAULT 'community'
        CHECK (data_source IN ('official', 'automated', 'verified', 'community')),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(provider_id, model_key, is_current)
);

-- Indexes for pricing
CREATE INDEX idx_pricing_provider ON provider_pricing(provider_id);
CREATE INDEX idx_pricing_model ON provider_pricing(model_key);
CREATE INDEX idx_pricing_current ON provider_pricing(provider_id, is_current) WHERE is_current = TRUE;

-- ============================================
-- PRICE HISTORY TABLE
-- ============================================
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    model_key VARCHAR(100) NOT NULL,

    -- Price at this point in time
    input_price DECIMAL(10,4),
    output_price DECIMAL(10,4),

    -- Change tracking
    price_change DECIMAL(10,4),       -- Change from previous (can be negative)
    price_change_pct DECIMAL(6,2),    -- Percentage change

    -- Context
    detected_by VARCHAR(20) DEFAULT 'automated'
        CHECK (detected_by IN ('automated', 'user_submission', 'official')),
    detected_at TIMESTAMPTZ DEFAULT NOW(),

    -- Optional note
    note TEXT
);

-- Indexes for price history
CREATE INDEX idx_price_history_provider ON price_history(provider_id);
CREATE INDEX idx_price_history_model ON price_history(model_key);
CREATE INDEX idx_price_history_detected ON price_history(detected_at DESC);

-- ============================================
-- TEST RESULTS TABLE
-- ============================================
CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,

    -- Test details
    test_at TIMESTAMPTZ DEFAULT NOW(),
    test_type VARCHAR(20) DEFAULT 'api_request'
        CHECK (test_type IN ('api_request', 'dns_check', 'latency')),

    -- Results
    success BOOLEAN NOT NULL,
    status_code INTEGER,              -- HTTP status code if applicable
    latency_ms INTEGER,               -- Response time in milliseconds
    error_message TEXT,

    -- What was tested
    test_endpoint VARCHAR(500),
    test_model VARCHAR(100),

    -- Verification
    price_accurate BOOLEAN,           -- Did returned price match expected?
    expected_price DECIMAL(10,4),
    actual_price DECIMAL(10,4)
);

-- Indexes for test results
CREATE INDEX idx_test_results_provider ON test_results(provider_id);
CREATE INDEX idx_test_results_at ON test_results(test_at DESC);
CREATE INDEX idx_test_results_success ON test_results(provider_id, success);

-- ============================================
-- USER SUBMISSIONS TABLE
-- ============================================
CREATE TABLE user_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    provider_name VARCHAR(255),      -- If provider doesn't exist yet

    -- Submitter info (optional for anonymous)
    submitter_ip VARCHAR(45),        -- Hashed for privacy
    submitter_hash VARCHAR(64),       -- SHA256 hash for uniqueness

    -- What was submitted
    submission_type VARCHAR(20) DEFAULT 'price_update'
        CHECK (submission_type IN ('price_update', 'new_provider', 'status_report', 'feedback')),
    model_key VARCHAR(100),
    new_input_price DECIMAL(10,4),
    new_output_price DECIMAL(10,4),

    -- Status
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'duplicate')),
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMPTZ,

    -- Context
    evidence TEXT,                    -- User-provided evidence/notes
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for user submissions
CREATE INDEX idx_submissions_status ON user_submissions(status);
CREATE INDEX idx_submissions_provider ON user_submissions(provider_id);
CREATE INDEX idx_submissions_created ON user_submissions(created_at DESC);

-- ============================================
-- AFFILIATE LINKS TABLE
-- ============================================
CREATE TABLE affiliate_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    link_type VARCHAR(20) DEFAULT 'affiliate'
        CHECK (link_type IN ('affiliate', 'referral', 'official')),

    -- Link details
    original_url VARCHAR(500) NOT NULL,
    affiliate_url VARCHAR(500) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,

    -- Tracking
    click_count INTEGER DEFAULT 0,
    last_clicked_at TIMESTAMPTZ,

    -- Commission info
    commission_rate DECIMAL(5,2),     -- Percentage
    commission_note TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for affiliate links
CREATE INDEX idx_affiliate_provider ON affiliate_links(provider_id);
CREATE INDEX idx_affiliate_active ON affiliate_links(provider_id, is_active) WHERE is_active = TRUE;

-- ============================================
-- AFFILIATE CLICKS TABLE (for tracking)
-- ============================================
CREATE TABLE affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_link_id UUID NOT NULL REFERENCES affiliate_links(id) ON DELETE CASCADE,

    -- Click context
    clicked_at TIMESTAMPTZ DEFAULT NOW(),
    ip_hash VARCHAR(64),              -- Hashed IP for fraud prevention
    user_agent TEXT,
    referer TEXT,

    -- UTM parameters
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100)
);

-- Indexes for clicks
CREATE INDEX idx_clicks_link ON affiliate_clicks(affiliate_link_id);
CREATE INDEX idx_clicks_at ON affiliate_clicks(clicked_at DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_providers_updated_at
    BEFORE UPDATE ON providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_affiliate_links_updated_at
    BEFORE UPDATE ON affiliate_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_provider_pricing_updated_at
    BEFORE UPDATE ON provider_pricing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- VIEWS
-- ============================================

-- Provider with current pricing (denormalized view)
CREATE VIEW providers_with_pricing AS
SELECT
    p.*,
    json_agg(
        json_build_object(
            'model_key', pp.model_key,
            'model_display_name', pp.model_display_name,
            'input_price', pp.input_price,
            'output_price', pp.output_price
        )
    ) FILTER (WHERE pp.is_current = TRUE) AS pricing,
    json_build_object(
        'total_tests', COUNT(tr.id),
        'successful_tests', COUNT(tr.id) FILTER (WHERE tr.success = TRUE),
        'avg_latency', AVG(tr.latency_ms) FILTER (WHERE tr.success = TRUE),
        'last_test', MAX(tr.test_at)
    ) AS test_stats
FROM providers p
LEFT JOIN provider_pricing pp ON p.id = pp.provider_id
LEFT JOIN test_results tr ON p.id = tr.provider_id
GROUP BY p.id;

-- Recent price changes view
CREATE VIEW recent_price_changes AS
SELECT
    ph.*,
    p.name AS provider_name,
    p.slug
FROM price_history ph
JOIN providers p ON ph.provider_id = p.id
WHERE ph.detected_at > NOW() - INTERVAL '7 days'
ORDER BY ph.detected_at DESC;

-- Provider health summary
CREATE VIEW provider_health AS
SELECT
    p.id,
    p.slug,
    p.name,
    p.status,
    p.risk_level,
    p.tier,
    -- Success rate over last 24 hours
    ROUND(
        COUNT(tr.id) FILTER (WHERE tr.test_at > NOW() - INTERVAL '24 hours' AND tr.success = TRUE) ::
        DECIMAL /
        NULLIF(COUNT(tr.id) FILTER (WHERE tr.test_at > NOW() - INTERVAL '24 hours'), 0) * 100,
        1
    ) AS success_rate_24h,
    -- Success rate over last 7 days
    ROUND(
        COUNT(tr.id) FILTER (WHERE tr.test_at > NOW() - INTERVAL '7 days' AND tr.success = TRUE) ::
        DECIMAL /
        NULLIF(COUNT(tr.id) FILTER (WHERE tr.test_at > NOW() - INTERVAL '7 days'), 0) * 100,
        1
    ) AS success_rate_7d,
    -- Average latency over last 24h
    AVG(tr.latency_ms) FILTER (WHERE tr.test_at > NOW() - INTERVAL '24 hours' AND tr.success = TRUE) AS avg_latency_24h,
    -- Last test time
    MAX(tr.test_at) AS last_test_at
FROM providers p
LEFT JOIN test_results tr ON p.id = tr.provider_id
GROUP BY p.id;
