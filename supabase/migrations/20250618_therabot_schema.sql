-- TheraBot Complete Schema Migration
-- Created: 2025-06-18

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User profiles table to extend auth.users with additional information
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    preferences JSONB DEFAULT '{}',
    emotional_baseline JSONB DEFAULT '{}',
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    account_status TEXT DEFAULT 'active'
);

-- Conversations table to store chat sessions
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Conversation',
    summary TEXT,
    sentiment_score FLOAT,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table for individual message content
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'bot')),
    emotion_detected TEXT,
    emotion_confidence FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coping strategies suggested to users
CREATE TABLE IF NOT EXISTS public.coping_strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    strategy_type TEXT NOT NULL CHECK (strategy_type IN ('breathing_exercise', 'affirmation', 'reflection', 'none')),
    content JSONB NOT NULL,
    was_helpful BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emotional journey tracking for user analysis
CREATE TABLE IF NOT EXISTS public.emotional_journey (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    emotions JSONB DEFAULT '[]',
    trends JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User feedback for specific messages or sessions
CREATE TABLE IF NOT EXISTS public.user_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User goals for personal growth tracking
CREATE TABLE IF NOT EXISTS public.user_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    target_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User activity tracking
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    message_count INTEGER DEFAULT 0,
    session_duration INTEGER DEFAULT 0, -- in seconds
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session information for usage analytics
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    duration INTEGER, -- in seconds
    device_info JSONB DEFAULT '{}',
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personalized insights for users
CREATE TABLE IF NOT EXISTS public.insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User journal entries for reflection
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    mood TEXT,
    tags TEXT[],
    is_private BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_coping_strategies_message_id ON public.coping_strategies(message_id);
CREATE INDEX IF NOT EXISTS idx_emotional_journey_user_id_date ON public.emotional_journey(user_id, date);

-- Enable Row Level Security on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coping_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotional_journey ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Create Row Level Security policies
-- User profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = id);

-- Conversations policies - STRICTLY PRIVATE - only the user can see their own conversations
CREATE POLICY "Users can view own conversations" 
ON public.conversations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" 
ON public.conversations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" 
ON public.conversations FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" 
ON public.conversations FOR DELETE 
USING (auth.uid() = user_id);

-- Explicitly disable service role access to conversation content
ALTER TABLE public.conversations FORCE ROW LEVEL SECURITY;

-- Messages policies - STRICTLY PRIVATE - only the user can access their messages
CREATE POLICY "Users can view only their own messages" 
ON public.messages FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert only their own messages" 
ON public.messages FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Enable strict Row Level Security on all content tables
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Apply strict privacy policies to all content-related tables
-- Coping strategies policies - STRICTLY PRIVATE
CREATE POLICY "Users can view own coping strategies" 
ON public.coping_strategies FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.messages 
    WHERE id = public.coping_strategies.message_id AND user_id = auth.uid()
));

-- Explicitly disable service role access to coping strategies
ALTER TABLE public.coping_strategies FORCE ROW LEVEL SECURITY;

-- Emotional journey policies - STRICTLY PRIVATE
CREATE POLICY "Users can view own emotional journey" 
ON public.emotional_journey FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emotional journey entries" 
ON public.emotional_journey FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Explicitly disable service role access to emotional journey data
ALTER TABLE public.emotional_journey FORCE ROW LEVEL SECURITY;

-- User feedback policies
CREATE POLICY "Users can manage own feedback" 
ON public.user_feedback FOR ALL 
USING (auth.uid() = user_id);

-- User goals policies
CREATE POLICY "Users can manage own goals" 
ON public.user_goals FOR ALL 
USING (auth.uid() = user_id);

-- User activities policies
CREATE POLICY "Users can view own activities" 
ON public.user_activities FOR SELECT 
USING (auth.uid() = user_id);

-- Sessions policies
CREATE POLICY "Users can view own sessions" 
ON public.sessions FOR SELECT 
USING (auth.uid() = user_id);

-- Insights policies
CREATE POLICY "Users can view own insights" 
ON public.insights FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own insights" 
ON public.insights FOR UPDATE 
USING (auth.uid() = user_id);

-- Journal entries policies - STRICTLY PRIVATE
CREATE POLICY "Users can manage own journal entries" 
ON public.journal_entries FOR ALL 
USING (auth.uid() = user_id);

-- Explicitly disable service role access to journal entries
ALTER TABLE public.journal_entries FORCE ROW LEVEL SECURITY;

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update last_seen_at in user_profiles table
CREATE OR REPLACE FUNCTION update_last_seen_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.user_profiles 
    SET last_seen_at = NOW() 
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_goals_updated_at
BEFORE UPDATE ON public.user_goals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
BEFORE UPDATE ON public.journal_entries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update last_seen timestamp whenever a new activity is recorded
CREATE TRIGGER update_user_last_seen
AFTER INSERT ON public.user_activities
FOR EACH ROW
EXECUTE FUNCTION update_last_seen_at();

-- Trigger to calculate session duration when a session ends
CREATE OR REPLACE FUNCTION calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_time IS NOT NULL AND OLD.end_time IS NULL THEN
        NEW.duration = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INTEGER;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_duration
BEFORE UPDATE ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION calculate_session_duration();

-- Function to update conversation's updated_at timestamp when new messages are added
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations 
    SET updated_at = NOW() 
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_last_activity
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- Add privacy notice function to record consent
CREATE TABLE IF NOT EXISTS public.privacy_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    privacy_version TEXT NOT NULL,
    consented_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- Enable RLS on privacy consents
ALTER TABLE public.privacy_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_consents FORCE ROW LEVEL SECURITY;

-- Privacy consent policies
CREATE POLICY "Users can view own privacy consents" 
ON public.privacy_consents FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own privacy consents" 
ON public.privacy_consents FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Encryption function for extra sensitive data if needed
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT, user_id UUID) 
RETURNS TEXT AS $$
BEGIN
    RETURN PGP_SYM_ENCRYPT(
        data,
        CONCAT(user_id::TEXT, '-', current_setting('app.encryption_key', TRUE))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decryption function for retrieval by authenticated user only
CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_data TEXT, user_id UUID) 
RETURNS TEXT AS $$
BEGIN
    IF user_id = auth.uid() THEN
        RETURN PGP_SYM_DECRYPT(
            encrypted_data,
            CONCAT(user_id::TEXT, '-', current_setting('app.encryption_key', TRUE))
        );
    ELSE
        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
