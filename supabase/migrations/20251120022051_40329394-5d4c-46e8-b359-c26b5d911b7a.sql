-- Add YouTube Watch Time and additional services
INSERT INTO public.services (name, description, price_per_1000, category, is_active) VALUES
-- YouTube Watch Time Services
('YouTube Watch Time - Standard', '4000 watch hours for monetization eligibility', 19.00, 'youtube', true),
('YouTube Watch Time - Non-Drop', '4000 watch hours guaranteed non-drop quality', 26.00, 'youtube', true),
('YouTube Watch Time - Premium', 'High retention watch time from real viewers', 35.00, 'youtube', true),

-- YouTube Additional Services
('YouTube Video Ranking', 'SEO optimization for video ranking', 45.00, 'youtube', true),
('YouTube Channel Growth Package', 'Complete channel growth with subs + views', 89.00, 'youtube', true),

-- Twitter/X Services
('Twitter Followers - Standard', 'Real Twitter/X followers', 4.50, 'twitter', true),
('Twitter Followers - Premium', 'High quality verified-looking followers', 12.00, 'twitter', true),
('Twitter Retweets', 'Boost your tweet reach', 6.00, 'twitter', true),
('Twitter Likes', 'Increase tweet engagement', 3.50, 'twitter', true),
('Twitter Video Views', 'Get more video views', 2.80, 'twitter', true),

-- TikTok Services  
('TikTok Followers - Standard', 'Grow your TikTok following', 5.00, 'tiktok', true),
('TikTok Followers - Premium', 'High quality real followers', 15.00, 'tiktok', true),
('TikTok Likes', 'Boost video engagement', 2.50, 'tiktok', true),
('TikTok Views - Fast', 'Instant video views', 1.20, 'tiktok', true),
('TikTok Shares', 'Viral reach through shares', 8.00, 'tiktok', true),
('TikTok Comments - Custom', 'Custom comments for videos', 12.00, 'tiktok', true),

-- Spotify Services
('Spotify Monthly Listeners', 'Increase monthly listeners', 8.50, 'spotify', true),
('Spotify Playlist Followers', 'Grow playlist following', 6.00, 'spotify', true),
('Spotify Track Plays', 'Boost track play count', 3.50, 'spotify', true),
('Spotify Saves', 'Get more track saves', 7.00, 'spotify', true),

-- Website Traffic
('Website Traffic - Organic', 'Real organic website visitors', 12.00, 'website', true),
('Website Traffic - Targeted', 'Geo-targeted quality traffic', 25.00, 'website', true),
('Website Traffic - Premium', 'High engagement quality traffic', 40.00, 'website', true)

ON CONFLICT (id) DO NOTHING;