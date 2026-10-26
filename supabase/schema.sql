-- ==============================================================================
-- PromptVista Database Schema (PostgreSQL / Supabase)
-- ==============================================================================

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    icon_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for categories (public read, authenticated admin write)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories 
    FOR ALL USING (auth.role() = 'authenticated');

-- 2. Create Prompts Table
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    prompt_text TEXT NOT NULL,
    negative_prompt TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category_slug TEXT NOT NULL,
    category_name TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    style TEXT NOT NULL,
    aspect_ratio TEXT NOT NULL DEFAULT '1:1',
    dimensions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_featured BOOLEAN DEFAULT false,
    is_free BOOLEAN DEFAULT true,
    suggested_tools TEXT[] DEFAULT '{}',
    license TEXT DEFAULT 'Unsplash Free Commercial License',
    author_name TEXT NOT NULL,
    author_url TEXT,
    source_model TEXT,
    is_published BOOLEAN DEFAULT true
);

-- Indexes for lightning fast searching and filtering
CREATE INDEX IF NOT EXISTS idx_prompts_slug ON public.prompts(slug);
CREATE INDEX IF NOT EXISTS idx_prompts_category_slug ON public.prompts(category_slug);
CREATE INDEX IF NOT EXISTS idx_prompts_is_featured ON public.prompts(is_featured);
CREATE INDEX IF NOT EXISTS idx_prompts_is_free ON public.prompts(is_free);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON public.prompts(created_at DESC);

-- Enable RLS on prompts
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
-- Everyone can read published prompts
CREATE POLICY "Public can view published prompts" ON public.prompts 
    FOR SELECT USING (is_published = true);
-- Authenticated users (admins) can insert/update/delete prompts
CREATE POLICY "Admins manage prompts" ON public.prompts 
    FOR ALL USING (auth.role() = 'authenticated');

-- 3. User Favorites Table
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, prompt_id)
);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own favorites" ON public.user_favorites 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users add own favorites" ON public.user_favorites 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users remove own favorites" ON public.user_favorites 
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Content Reports Table (for community safety & DMCA/reporting workflow)
CREATE TABLE IF NOT EXISTS public.content_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID REFERENCES public.prompts(id) ON DELETE SET NULL,
    prompt_slug TEXT NOT NULL,
    reason TEXT NOT NULL,
    details TEXT,
    reporter_email TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
-- Public can submit a report without needing an account
CREATE POLICY "Public can submit content report" ON public.content_reports 
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view reports" ON public.content_reports 
    FOR SELECT USING (auth.role() = 'authenticated');
