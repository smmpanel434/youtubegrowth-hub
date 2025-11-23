-- Add tracking fields to orders table
ALTER TABLE public.orders 
ADD COLUMN start_time timestamp with time zone,
ADD COLUMN before_count integer,
ADD COLUMN current_count integer;

-- Insert new services for Google form polls and online voting
INSERT INTO public.services (name, description, price_per_1000, category, is_active) VALUES
('Google Form Poll Votes', 'High-quality votes for your Google Form polls from real accounts. Perfect for surveys and research. Fast delivery within 24-48 hours.', 15.00, 'google', true),
('Google Form Poll Votes - Premium', 'Premium votes from verified accounts with geographic targeting. Includes detailed analytics and guaranteed completion rate.', 25.00, 'google', true),
('Online Voting - Standard', 'Real votes for online contests and competitions. Works with most voting platforms. Natural voting pattern to avoid detection.', 18.00, 'voting', true),
('Online Voting - Premium', 'Premium voting service with IP rotation and device diversity. Highest success rate for competitive voting campaigns.', 30.00, 'voting', true),
('Survey Responses - Basic', 'Genuine survey responses for market research and feedback collection. Quick turnaround time.', 12.00, 'survey', true),
('Survey Responses - Detailed', 'Comprehensive survey responses with thoughtful answers. Ideal for academic research and detailed feedback.', 22.00, 'survey', true);

-- Update existing services with more detailed descriptions
UPDATE public.services 
SET description = 'High-retention YouTube watch time from real viewers. Boosts your video ranking and helps meet monetization requirements. 4000+ hours available. Natural viewing patterns ensure compliance with YouTube policies.'
WHERE name LIKE '%Watch Time%' AND description IS NOT NULL;

UPDATE public.services 
SET description = 'Authentic YouTube views from real users worldwide. Improves video visibility and engagement metrics. Fast delivery with gradual increase to maintain natural growth patterns. 100% safe and compliant.'
WHERE name LIKE '%Views%' AND category = 'youtube';

UPDATE public.services 
SET description = 'Genuine YouTube likes from active accounts. Increases video credibility and social proof. Delivered gradually over 24-72 hours to ensure natural engagement patterns.'
WHERE name LIKE '%Likes%' AND category = 'youtube';

UPDATE public.services 
SET description = 'Real YouTube subscribers who stay engaged with your content. Helps build channel authority and reach monetization thresholds. Non-drop guarantee with refill protection.'
WHERE name LIKE '%Subscribers%' AND category = 'youtube';