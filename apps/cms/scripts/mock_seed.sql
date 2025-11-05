-- Mock Seed SQL File
-- Inserts mock data with public_id starting with "mock_"
-- Run this file to populate the database with test data

-- Insert mock tenants
INSERT INTO tenants (public_id, name) VALUES
  ('mock_tenant_1', 'CMD-A-2024'),
  ('mock_tenant_2', 'CMD-B-2024'),
  ('mock_tenant_3', 'CMD-C-2024')
ON CONFLICT DO NOTHING;

-- Insert mock categories (global, not tenant-specific)
INSERT INTO categories (public_id, title) VALUES
  ('mock_category_1', 'Photography'),
  ('mock_category_2', 'Videography'),
  ('mock_category_3', 'Visual Design'),
  ('mock_category_4', 'Development'),
  ('mock_category_5', '3D'),
  ('mock_category_6', 'VR')
ON CONFLICT DO NOTHING;

-- Insert mock users (reference mock tenants)
INSERT INTO users (public_id, email, given_name, family_name, tenant_id, email_verified, role)
SELECT 
  'mock_user_1',
  'sarah.vandenberg@zuyd.nl',
  'Sarah',
  'van den Berg',
  id,
  true,
  'ADMIN'::role
FROM tenants WHERE public_id = 'mock_tenant_1'
ON CONFLICT DO NOTHING;

INSERT INTO users (public_id, email, given_name, family_name, tenant_id, email_verified, role)
SELECT 
  'mock_user_2',
  'lucas.janssen@zuyd.nl',
  'Lucas',
  'Janssen',
  id,
  true,
  'EDITOR'::role
FROM tenants WHERE public_id = 'mock_tenant_1'
ON CONFLICT DO NOTHING;

INSERT INTO users (public_id, email, given_name, family_name, tenant_id, email_verified, role)
SELECT 
  'mock_user_3',
  'emma.dewitt@zuyd.nl',
  'Emma',
  'de Witt',
  id,
  true,
  'USER'::role
FROM tenants WHERE public_id = 'mock_tenant_2'
ON CONFLICT DO NOTHING;

INSERT INTO users (public_id, email, given_name, family_name, tenant_id, email_verified, role)
SELECT 
  'mock_user_4',
  'thomas.bakker@zuyd.nl',
  'Thomas',
  'Bakker',
  id,
  true,
  'EDITOR'::role
FROM tenants WHERE public_id = 'mock_tenant_3'
ON CONFLICT DO NOTHING;

INSERT INTO users (public_id, email, given_name, family_name, tenant_id, email_verified, role)
SELECT 
  'mock_user_5',
  'sophie.meijer@zuyd.nl',
  'Sophie',
  'Meijer',
  id,
  true,
  'USER'::role
FROM tenants WHERE public_id = 'mock_tenant_1'
ON CONFLICT DO NOTHING;

INSERT INTO users (public_id, email, given_name, family_name, tenant_id, email_verified, role)
SELECT 
  'mock_user_6',
  'noah.visser@zuyd.nl',
  'Noah',
  'Visser',
  id,
  true,
  'USER'::role
FROM tenants WHERE public_id = 'mock_tenant_2'
ON CONFLICT DO NOTHING;

-- Insert mock collections (reference mock tenants)
INSERT INTO collections (public_id, tenant_id, title)
SELECT 
  'mock_collection_1',
  id,
  'graduation-2024-CMD-A'
FROM tenants WHERE public_id = 'mock_tenant_1'
ON CONFLICT DO NOTHING;

INSERT INTO collections (public_id, tenant_id, title)
SELECT 
  'mock_collection_2',
  id,
  'speculative-design-2024-CMD-A'
FROM tenants WHERE public_id = 'mock_tenant_1'
ON CONFLICT DO NOTHING;

INSERT INTO collections (public_id, tenant_id, title)
SELECT 
  'mock_collection_3',
  id,
  'multi-media-story-2024-CMD-B'
FROM tenants WHERE public_id = 'mock_tenant_2'
ON CONFLICT DO NOTHING;

INSERT INTO collections (public_id, tenant_id, title)
SELECT 
  'mock_collection_4',
  id,
  'graduation-2024-CMD-C'
FROM tenants WHERE public_id = 'mock_tenant_3'
ON CONFLICT DO NOTHING;

INSERT INTO collections (public_id, tenant_id, title)
SELECT 
  'mock_collection_5',
  id,
  'speculative-design-2024-CMD-B'
FROM tenants WHERE public_id = 'mock_tenant_2'
ON CONFLICT DO NOTHING;

-- Insert mock objects (20 objects with realistic names, all with video_r2_key = '2/1/video' and cf_r2_link = '2/1')
INSERT INTO objects (public_id, title, description, user_id, collection_id, category_id, cf_r2_link, video_r2_key, public)
SELECT 
  'mock_object_1',
  'STOP',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "STOP", "type": "text", "marks": [{"type": "bold"}]}, {"text": " is a visual novel created by students of Zuyd Hogeschool for the CBS.", "type": "text"}]}]}'::jsonb,
  u.id,
  c.id,
  cat.id,
  '2/1',
  '2/1/video',
  true
FROM users u
CROSS JOIN collections c
CROSS JOIN categories cat
WHERE u.public_id = 'mock_user_1'
  AND c.public_id = 'mock_collection_1'
  AND cat.public_id = 'mock_category_3'
ON CONFLICT DO NOTHING;

INSERT INTO objects (public_id, title, description, user_id, collection_id, category_id, cf_r2_link, video_r2_key, public)
SELECT 
  'mock_object_2',
  'Urban Rhythms',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Urban Rhythms", "type": "text", "marks": [{"type": "bold"}]}, {"text": " explores the intersection of street photography and sound design, capturing the pulse of city life through visual and auditory narratives.", "type": "text"}]}]}'::jsonb,
  u.id,
  c.id,
  cat.id,
  '2/1',
  '2/1/video',
  true
FROM users u
CROSS JOIN collections c
CROSS JOIN categories cat
WHERE u.public_id = 'mock_user_2'
  AND c.public_id = 'mock_collection_2'
  AND cat.public_id = 'mock_category_1'
ON CONFLICT DO NOTHING;

INSERT INTO objects (public_id, title, description, user_id, collection_id, category_id, cf_r2_link, video_r2_key, public)
SELECT 
  'mock_object_3',
  'Echoes of Tomorrow',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Echoes of Tomorrow", "type": "text", "marks": [{"type": "bold"}]}, {"text": " is a speculative design project that imagines future technologies and their impact on human interaction.", "type": "text"}]}]}'::jsonb,
  u.id,
  c.id,
  cat.id,
  '2/1',
  '2/1/video',
  true
FROM users u
CROSS JOIN collections c
CROSS JOIN categories cat
WHERE u.public_id = 'mock_user_3'
  AND c.public_id = 'mock_collection_3'
  AND cat.public_id = 'mock_category_3'
ON CONFLICT DO NOTHING;

INSERT INTO objects (public_id, title, description, user_id, collection_id, category_id, cf_r2_link, video_r2_key, public)
SELECT 
  'mock_object_4',
  'Digital Canvas',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Digital Canvas", "type": "text", "marks": [{"type": "bold"}]}, {"text": " is an interactive web application that allows users to create and share digital art in real-time.", "type": "text"}]}]}'::jsonb,
  u.id,
  c.id,
  cat.id,
  '2/1',
  '2/1/video',
  true
FROM users u
CROSS JOIN collections c
CROSS JOIN categories cat
WHERE u.public_id = 'mock_user_4'
  AND c.public_id = 'mock_collection_4'
  AND cat.public_id = 'mock_category_4'
ON CONFLICT DO NOTHING;

INSERT INTO objects (public_id, title, description, user_id, collection_id, category_id, cf_r2_link, video_r2_key, public)
SELECT 
  'mock_object_5',
  'Metamorphosis',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Metamorphosis", "type": "text", "marks": [{"type": "bold"}]}, {"text": " is a documentary film exploring personal transformation and growth through the lens of modern storytelling.", "type": "text"}]}]}'::jsonb,
  u.id,
  c.id,
  cat.id,
  '2/1',
  '2/1/video',
  true
FROM users u
CROSS JOIN collections c
CROSS JOIN categories cat
WHERE u.public_id = 'mock_user_5'
  AND c.public_id = 'mock_collection_1'
  AND cat.public_id = 'mock_category_2'
ON CONFLICT DO NOTHING;

INSERT INTO objects (public_id, title, description, user_id, collection_id, category_id, cf_r2_link, video_r2_key, public)
SELECT 
  'mock_object_6',
  'Virtual Landscapes',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Virtual Landscapes", "type": "text", "marks": [{"type": "bold"}]}, {"text": " immerses users in breathtaking VR environments, blurring the line between reality and digital artistry.", "type": "text"}]}]}'::jsonb,
  u.id,
  c.id,
  cat.id,
  '2/1',
  '2/1/video',
  true
FROM users u
CROSS JOIN collections c
CROSS JOIN categories cat
WHERE u.public_id = 'mock_user_6'
  AND c.public_id = 'mock_collection_5'
  AND cat.public_id = 'mock_category_6'
ON CONFLICT DO NOTHING;

INSERT INTO objects (public_id, title, description, user_id, collection_id, category_id, cf_r2_link, video_r2_key, public)
SELECT 
  'mock_object_7',
  'Light & Shadow',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Light & Shadow", "type": "text", "marks": [{"type": "bold"}]}, {"text": " is a photography series that explores the dramatic interplay between illumination and darkness in urban architecture.", "type": "text"}]}]}'::jsonb,
  u.id,
  c.id,
  cat.id,
  '2/1',
  '2/1/video',
  true
FROM users u
CROSS JOIN collections c
CROSS JOIN categories cat
WHERE u.public_id = 'mock_user_1'
  AND c.public_id = 'mock_collection_1'
  AND cat.public_id = 'mock_category_1'
ON CONFLICT DO NOTHING;

INSERT INTO objects (public_id, title, description, user_id, collection_id, category_id, cf_r2_link, video_r2_key, public)
SELECT 
  'mock_object_8',
  'Nexus',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Nexus", "type": "text", "marks": [{"type": "bold"}]}, {"text": " is a platform connecting artists and creators with opportunities for collaboration and creative exchange.", "type": "text"}]}]}'::jsonb,
  u.id,
  c.id,
  cat.id,
  '2/1',
  '2/1/video',
  true
FROM users u
CROSS JOIN collections c
CROSS JOIN categories cat
WHERE u.public_id = 'mock_user_2'
  AND c.public_id = 'mock_collection_2'
  AND cat.public_id = 'mock_category_4'
ON CONFLICT DO NOTHING;

INSERT INTO objects (public_id, title, description, user_id, collection_id, category_id, cf_r2_link, video_r2_key, public)
SELECT 
  'mock_object_9',
  'Fragmented Memories',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Fragmented Memories", "type": "text", "marks": [{"type": "bold"}]}, {"text": " is a multimedia installation that uses video projection and sound to explore themes of nostalgia and loss.", "type": "text"}]}]}'::jsonb,
  u.id,
  c.id,
  cat.id,
  '2/1',
  '2/1/video',
  true
FROM users u
CROSS JOIN collections c
CROSS JOIN categories cat
WHERE u.public_id = 'mock_user_3'
  AND c.public_id = 'mock_collection_3'
  AND cat.public_id = 'mock_category_2'
ON CONFLICT DO NOTHING;

INSERT INTO objects (public_id, title, description, user_id, collection_id, category_id, cf_r2_link, video_r2_key, public)
SELECT 
  'mock_object_10',
  'Synthetic Dreams',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Synthetic Dreams", "type": "text", "marks": [{"type": "bold"}]}, {"text": " is a 3D animation project that visualizes abstract concepts of artificial intelligence and consciousness.", "type": "text"}]}]}'::jsonb,
  u.id,
  c.id,
  cat.id,
  '2/1',
  '2/1/video',
  true
FROM users u
CROSS JOIN collections c
CROSS JOIN categories cat
WHERE u.public_id = 'mock_user_4'
  AND c.public_id = 'mock_collection_4'
  AND cat.public_id = 'mock_category_5'
ON CONFLICT DO NOTHING;

INSERT INTO objects (public_id, title, description, user_id, collection_id, category_id, cf_r2_link, video_r2_key, public)
SELECT 
  'mock_object_11',
  'Chromatic Flow',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Chromatic Flow", "type": "text", "marks": [{"type": "bold"}]}, {"text": " is a motion graphics piece that uses color and movement to create a meditative visual experience.", "type": "text"}]}]}'::jsonb,
  u.id,
  c.id,
  cat.id,
  '2/1',
  '2/1/video',
  true
FROM users u
CROSS JOIN collections c
CROSS JOIN categories cat
WHERE u.public_id = 'mock_user_5'
  AND c.public_id = 'mock_collection_1'
  AND cat.public_id = 'mock_category_3'
ON CONFLICT DO NOTHING;

INSERT INTO objects (public_id, title, description, user_id, collection_id, category_id, cf_r2_link, video_r2_key, public)
SELECT 
  'mock_object_12',
  'Parallel Realities',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Parallel Realities", "type": "text", "marks": [{"type": "bold"}]}, {"text": " is a VR experience that allows users to explore alternate dimensions and parallel universes through immersive storytelling.", "type": "text"}]}]}'::jsonb,
  u.id,
  c.id,
  cat.id,
  '2/1',
  '2/1/video',
  true
FROM users u
CROSS JOIN collections c
CROSS JOIN categories cat
WHERE u.public_id = 'mock_user_6'
  AND c.public_id = 'mock_collection_5'
  AND cat.public_id = 'mock_category_6'
ON CONFLICT DO NOTHING;

INSERT INTO objects (public_id, title, description, user_id, collection_id, category_id, cf_r2_link, video_r2_key, public)
SELECT 
  'mock_object_13',
  'Transient Moments',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Transient Moments", "type": "text", "marks": [{"type": "bold"}]}, {"text": " captures fleeting instants in time through a series of documentary photographs taken across different cities.", "type": "text"}]}]}'::jsonb,
  u.id,
  c.id,
  cat.id,
  '2/1',
  '2/1/video',
  true
FROM users u
CROSS JOIN collections c
CROSS JOIN categories cat
WHERE u.public_id = 'mock_user_1'
  AND c.public_id = 'mock_collection_2'
  AND cat.public_id = 'mock_category_1'
ON CONFLICT DO NOTHING;

INSERT INTO objects (public_id, title, description, user_id, collection_id, category_id, cf_r2_link, video_r2_key, public)
SELECT 
  'mock_object_14',
  'Code & Creativity',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Code & Creativity", "type": "text", "marks": [{"type": "bold"}]}, {"text": " is an interactive web project that generates unique visual patterns based on algorithmic art principles.", "type": "text"}]}]}'::jsonb,
  u.id,
  c.id,
  cat.id,
  '2/1',
  '2/1/video',
  true
FROM users u
CROSS JOIN collections c
CROSS JOIN categories cat
WHERE u.public_id = 'mock_user_2'
  AND c.public_id = 'mock_collection_1'
  AND cat.public_id = 'mock_category_4'
ON CONFLICT DO NOTHING;

INSERT INTO objects (public_id, title, description, user_id, collection_id, category_id, cf_r2_link, video_r2_key, public)
SELECT 
  'mock_object_15',
  'The Last Archive',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "The Last Archive", "type": "text", "marks": [{"type": "bold"}]}, {"text": " is a speculative design project imagining a future where physical archives have been digitized and their original forms lost.", "type": "text"}]}]}'::jsonb,
  u.id,
  c.id,
  cat.id,
  '2/1',
  '2/1/video',
  true
FROM users u
CROSS JOIN collections c
CROSS JOIN categories cat
WHERE u.public_id = 'mock_user_3'
  AND c.public_id = 'mock_collection_2'
  AND cat.public_id = 'mock_category_3'
ON CONFLICT DO NOTHING;

INSERT INTO objects (public_id, title, description, user_id, collection_id, category_id, cf_r2_link, video_r2_key, public)
SELECT 
  'mock_object_16',
  'Cinematic Portraits',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Cinematic Portraits", "type": "text", "marks": [{"type": "bold"}]}, {"text": " is a video series featuring intimate character studies filmed in various urban and natural settings.", "type": "text"}]}]}'::jsonb,
  u.id,
  c.id,
  cat.id,
  '2/1',
  '2/1/video',
  true
FROM users u
CROSS JOIN collections c
CROSS JOIN categories cat
WHERE u.public_id = 'mock_user_4'
  AND c.public_id = 'mock_collection_3'
  AND cat.public_id = 'mock_category_2'
ON CONFLICT DO NOTHING;

INSERT INTO objects (public_id, title, description, user_id, collection_id, category_id, cf_r2_link, video_r2_key, public)
SELECT 
  'mock_object_17',
  'Digital Sculptures',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Digital Sculptures", "type": "text", "marks": [{"type": "bold"}]}, {"text": " is a collection of 3D rendered artworks that explore form, texture, and light in virtual space.", "type": "text"}]}]}'::jsonb,
  u.id,
  c.id,
  cat.id,
  '2/1',
  '2/1/video',
  true
FROM users u
CROSS JOIN collections c
CROSS JOIN categories cat
WHERE u.public_id = 'mock_user_5'
  AND c.public_id = 'mock_collection_4'
  AND cat.public_id = 'mock_category_5'
ON CONFLICT DO NOTHING;

INSERT INTO objects (public_id, title, description, user_id, collection_id, category_id, cf_r2_link, video_r2_key, public)
SELECT 
  'mock_object_18',
  'Interface Poetry',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Interface Poetry", "type": "text", "marks": [{"type": "bold"}]}, {"text": " is a UI/UX design project that reimagines digital interfaces as expressive, poetic forms of communication.", "type": "text"}]}]}'::jsonb,
  u.id,
  c.id,
  cat.id,
  '2/1',
  '2/1/video',
  true
FROM users u
CROSS JOIN collections c
CROSS JOIN categories cat
WHERE u.public_id = 'mock_user_6'
  AND c.public_id = 'mock_collection_1'
  AND cat.public_id = 'mock_category_3'
ON CONFLICT DO NOTHING;

INSERT INTO objects (public_id, title, description, user_id, collection_id, category_id, cf_r2_link, video_r2_key, public)
SELECT 
  'mock_object_19',
  'Ephemeral Bonds',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Ephemeral Bonds", "type": "text", "marks": [{"type": "bold"}]}, {"text": " is a multimedia narrative exploring human connections in the digital age through photography and video essays.", "type": "text"}]}]}'::jsonb,
  u.id,
  c.id,
  cat.id,
  '2/1',
  '2/1/video',
  true
FROM users u
CROSS JOIN collections c
CROSS JOIN categories cat
WHERE u.public_id = 'mock_user_1'
  AND c.public_id = 'mock_collection_3'
  AND cat.public_id = 'mock_category_1'
ON CONFLICT DO NOTHING;

INSERT INTO objects (public_id, title, description, user_id, collection_id, category_id, cf_r2_link, video_r2_key, public)
SELECT 
  'mock_object_20',
  'Quantum Aesthetics',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Quantum Aesthetics", "type": "text", "marks": [{"type": "bold"}]}, {"text": " is a speculative VR installation that visualizes quantum physics principles through immersive artistic experiences.", "type": "text"}]}]}'::jsonb,
  u.id,
  c.id,
  cat.id,
  '2/1',
  '2/1/video',
  true
FROM users u
CROSS JOIN collections c
CROSS JOIN categories cat
WHERE u.public_id = 'mock_user_2'
  AND c.public_id = 'mock_collection_5'
  AND cat.public_id = 'mock_category_6'
ON CONFLICT DO NOTHING;

-- Insert mock iterations (3-5 iterations per object)
-- Object 1: STOP (5 iterations)
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Initial Concept', NOW() - INTERVAL '90 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Initial concept development for the visual novel.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '90 days'
FROM objects o WHERE o.public_id = 'mock_object_1' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Character Design', NOW() - INTERVAL '75 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "First pass on character designs and visual style.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '75 days'
FROM objects o WHERE o.public_id = 'mock_object_1' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Storyboarding', NOW() - INTERVAL '60 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Completed storyboard for key narrative moments.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '60 days'
FROM objects o WHERE o.public_id = 'mock_object_1' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Prototype Build', NOW() - INTERVAL '45 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "First playable prototype with core mechanics implemented.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '45 days'
FROM objects o WHERE o.public_id = 'mock_object_1' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Final Polish', NOW() - INTERVAL '15 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Final iteration with all assets polished and narrative complete.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '15 days'
FROM objects o WHERE o.public_id = 'mock_object_1' ON CONFLICT DO NOTHING;

-- Object 2: Urban Rhythms (4 iterations)
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Field Research', NOW() - INTERVAL '70 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Initial field research and location scouting in urban environments.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '70 days'
FROM objects o WHERE o.public_id = 'mock_object_2' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Photo Series', NOW() - INTERVAL '55 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Completed first set of street photography capturing urban rhythms.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '55 days'
FROM objects o WHERE o.public_id = 'mock_object_2' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Sound Design', NOW() - INTERVAL '40 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Recorded and edited ambient sounds to accompany the visual narrative.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '40 days'
FROM objects o WHERE o.public_id = 'mock_object_2' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Integration', NOW() - INTERVAL '20 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Final integration of photography and sound design into cohesive multimedia piece.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '20 days'
FROM objects o WHERE o.public_id = 'mock_object_2' ON CONFLICT DO NOTHING;

-- Object 3: Echoes of Tomorrow (4 iterations)
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Research Phase', NOW() - INTERVAL '80 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Research into emerging technologies and their potential future impacts.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '80 days'
FROM objects o WHERE o.public_id = 'mock_object_3' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Concept Development', NOW() - INTERVAL '65 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Developed initial concepts for speculative design interventions.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '65 days'
FROM objects o WHERE o.public_id = 'mock_object_3' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Prototype Creation', NOW() - INTERVAL '50 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Created physical and digital prototypes of speculative objects.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '50 days'
FROM objects o WHERE o.public_id = 'mock_object_3' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Documentation', NOW() - INTERVAL '25 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Final documentation and presentation materials for the speculative design project.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '25 days'
FROM objects o WHERE o.public_id = 'mock_object_3' ON CONFLICT DO NOTHING;

-- Object 4: Digital Canvas (5 iterations)
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Wireframes', NOW() - INTERVAL '85 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Initial wireframes and user flow diagrams for the web application.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '85 days'
FROM objects o WHERE o.public_id = 'mock_object_4' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Frontend Development', NOW() - INTERVAL '70 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Started frontend development with React and canvas API integration.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '70 days'
FROM objects o WHERE o.public_id = 'mock_object_4' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Backend API', NOW() - INTERVAL '55 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Implemented backend API for user authentication and art sharing functionality.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '55 days'
FROM objects o WHERE o.public_id = 'mock_object_4' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Real-time Features', NOW() - INTERVAL '40 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Added real-time collaboration features using WebSockets.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '40 days'
FROM objects o WHERE o.public_id = 'mock_object_4' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Beta Release', NOW() - INTERVAL '10 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Beta release with core features complete and user testing initiated.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '10 days'
FROM objects o WHERE o.public_id = 'mock_object_4' ON CONFLICT DO NOTHING;

-- Object 5: Metamorphosis (3 iterations)
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Pre-production', NOW() - INTERVAL '60 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Pre-production planning, script development, and interview scheduling.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '60 days'
FROM objects o WHERE o.public_id = 'mock_object_5' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Principal Photography', NOW() - INTERVAL '45 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Completed principal photography and interview recordings.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '45 days'
FROM objects o WHERE o.public_id = 'mock_object_5' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Post-production', NOW() - INTERVAL '20 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Final edit completed with color grading and sound mixing.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '20 days'
FROM objects o WHERE o.public_id = 'mock_object_5' ON CONFLICT DO NOTHING;

-- Object 6: Virtual Landscapes (4 iterations)
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Environment Design', NOW() - INTERVAL '75 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Started designing virtual environments using 3D modeling software.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '75 days'
FROM objects o WHERE o.public_id = 'mock_object_6' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'VR Integration', NOW() - INTERVAL '60 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Integrated environments into Unity and implemented VR interaction systems.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '60 days'
FROM objects o WHERE o.public_id = 'mock_object_6' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Optimization', NOW() - INTERVAL '45 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Optimized performance for smooth VR experience across different hardware.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '45 days'
FROM objects o WHERE o.public_id = 'mock_object_6' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'User Testing', NOW() - INTERVAL '20 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Conducted user testing sessions and refined based on feedback.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '20 days'
FROM objects o WHERE o.public_id = 'mock_object_6' ON CONFLICT DO NOTHING;

-- Object 7: Light & Shadow (4 iterations)
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Location Scouting', NOW() - INTERVAL '70 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Scouted locations with interesting architectural lighting conditions.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '70 days'
FROM objects o WHERE o.public_id = 'mock_object_7' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Photo Shoot', NOW() - INTERVAL '55 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Completed first photo shoot capturing light and shadow patterns.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '55 days'
FROM objects o WHERE o.public_id = 'mock_object_7' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Selection & Editing', NOW() - INTERVAL '40 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Selected best images and applied consistent editing style.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '40 days'
FROM objects o WHERE o.public_id = 'mock_object_7' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Series Completion', NOW() - INTERVAL '15 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Final series with 20 selected images ready for exhibition.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '15 days'
FROM objects o WHERE o.public_id = 'mock_object_7' ON CONFLICT DO NOTHING;

-- Object 8: Nexus (5 iterations)
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Market Research', NOW() - INTERVAL '90 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Conducted market research and user interviews to understand needs.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '90 days'
FROM objects o WHERE o.public_id = 'mock_object_8' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'MVP Development', NOW() - INTERVAL '75 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Built minimum viable product with core features.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '75 days'
FROM objects o WHERE o.public_id = 'mock_object_8' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'User Profiles', NOW() - INTERVAL '60 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Implemented user profiles and portfolio showcase features.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '60 days'
FROM objects o WHERE o.public_id = 'mock_object_8' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Matching System', NOW() - INTERVAL '45 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Developed algorithm for matching artists with collaboration opportunities.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '45 days'
FROM objects o WHERE o.public_id = 'mock_object_8' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Launch Preparation', NOW() - INTERVAL '10 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Final testing and preparation for public launch.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '10 days'
FROM objects o WHERE o.public_id = 'mock_object_8' ON CONFLICT DO NOTHING;

-- Object 9: Fragmented Memories (3 iterations)
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Concept Development', NOW() - INTERVAL '65 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Developed concept for multimedia installation exploring memory.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '65 days'
FROM objects o WHERE o.public_id = 'mock_object_9' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Media Production', NOW() - INTERVAL '50 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Produced video content and recorded soundscapes for installation.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '50 days'
FROM objects o WHERE o.public_id = 'mock_object_9' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Installation Setup', NOW() - INTERVAL '25 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Completed installation setup with projection mapping and sound system.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '25 days'
FROM objects o WHERE o.public_id = 'mock_object_9' ON CONFLICT DO NOTHING;

-- Object 10: Synthetic Dreams (4 iterations)
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, '3D Modeling', NOW() - INTERVAL '80 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Started 3D modeling of abstract forms representing AI concepts.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '80 days'
FROM objects o WHERE o.public_id = 'mock_object_10' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Animation', NOW() - INTERVAL '65 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Created keyframe animations showing transformation and evolution.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '65 days'
FROM objects o WHERE o.public_id = 'mock_object_10' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Rendering', NOW() - INTERVAL '50 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Rendered final animation sequences with advanced lighting and materials.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '50 days'
FROM objects o WHERE o.public_id = 'mock_object_10' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Post-production', NOW() - INTERVAL '20 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Final compositing and color grading for completed animation.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '20 days'
FROM objects o WHERE o.public_id = 'mock_object_10' ON CONFLICT DO NOTHING;

-- Object 11: Chromatic Flow (3 iterations)
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Design Exploration', NOW() - INTERVAL '60 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Explored color palettes and motion patterns for the piece.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '60 days'
FROM objects o WHERE o.public_id = 'mock_object_11' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Animation Production', NOW() - INTERVAL '45 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Produced animated sequences with flowing color transitions.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '45 days'
FROM objects o WHERE o.public_id = 'mock_object_11' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Final Composition', NOW() - INTERVAL '20 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Final composition with music synchronization and timing refinements.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '20 days'
FROM objects o WHERE o.public_id = 'mock_object_11' ON CONFLICT DO NOTHING;

-- Object 12: Parallel Realities (5 iterations)
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'World Building', NOW() - INTERVAL '85 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Designed multiple parallel worlds with distinct visual and narrative themes.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '85 days'
FROM objects o WHERE o.public_id = 'mock_object_12' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'VR Development', NOW() - INTERVAL '70 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Started VR development in Unity with locomotion and interaction systems.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '70 days'
FROM objects o WHERE o.public_id = 'mock_object_12' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Narrative Integration', NOW() - INTERVAL '55 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Integrated branching narrative system allowing users to explore different realities.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '55 days'
FROM objects o WHERE o.public_id = 'mock_object_12' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Testing & Refinement', NOW() - INTERVAL '40 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Tested VR experience and refined based on user feedback and comfort.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '40 days'
FROM objects o WHERE o.public_id = 'mock_object_12' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Final Build', NOW() - INTERVAL '15 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Final optimized build ready for VR platform release.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '15 days'
FROM objects o WHERE o.public_id = 'mock_object_12' ON CONFLICT DO NOTHING;

-- Object 13: Transient Moments (4 iterations)
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Travel Planning', NOW() - INTERVAL '75 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Planned travel routes to capture moments across different cities.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '75 days'
FROM objects o WHERE o.public_id = 'mock_object_13' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Photography Series', NOW() - INTERVAL '60 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Completed photography series documenting transient moments in urban spaces.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '60 days'
FROM objects o WHERE o.public_id = 'mock_object_13' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Selection Process', NOW() - INTERVAL '45 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Curated selection of 30 images representing the best captured moments.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '45 days'
FROM objects o WHERE o.public_id = 'mock_object_13' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Exhibition Prep', NOW() - INTERVAL '20 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Prepared final selection for exhibition display and digital portfolio.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '20 days'
FROM objects o WHERE o.public_id = 'mock_object_13' ON CONFLICT DO NOTHING;

-- Object 14: Code & Creativity (4 iterations)
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Algorithm Design', NOW() - INTERVAL '70 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Designed algorithms for generating unique visual patterns.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '70 days'
FROM objects o WHERE o.public_id = 'mock_object_14' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Web Implementation', NOW() - INTERVAL '55 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Implemented web interface with real-time pattern generation.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '55 days'
FROM objects o WHERE o.public_id = 'mock_object_14' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'User Controls', NOW() - INTERVAL '40 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Added interactive controls allowing users to manipulate parameters.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '40 days'
FROM objects o WHERE o.public_id = 'mock_object_14' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Sharing Features', NOW() - INTERVAL '20 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Implemented sharing functionality for users to export their creations.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '20 days'
FROM objects o WHERE o.public_id = 'mock_object_14' ON CONFLICT DO NOTHING;

-- Object 15: The Last Archive (3 iterations)
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Research & Concept', NOW() - INTERVAL '65 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Research into archive digitization and speculative future scenarios.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '65 days'
FROM objects o WHERE o.public_id = 'mock_object_15' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Design Artifacts', NOW() - INTERVAL '50 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Created speculative archive artifacts and digital preservation systems.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '50 days'
FROM objects o WHERE o.public_id = 'mock_object_15' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Exhibition Design', NOW() - INTERVAL '25 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Designed exhibition space showcasing the speculative archive project.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '25 days'
FROM objects o WHERE o.public_id = 'mock_object_15' ON CONFLICT DO NOTHING;

-- Object 16: Cinematic Portraits (4 iterations)
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Pre-production', NOW() - INTERVAL '70 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Pre-production planning, casting, and location scouting.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '70 days'
FROM objects o WHERE o.public_id = 'mock_object_16' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Filming', NOW() - INTERVAL '55 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Completed filming sessions with subjects in various environments.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '55 days'
FROM objects o WHERE o.public_id = 'mock_object_16' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Editing', NOW() - INTERVAL '40 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Edited individual portrait videos with cinematic color grading.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '40 days'
FROM objects o WHERE o.public_id = 'mock_object_16' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Series Completion', NOW() - INTERVAL '15 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Final series compilation with consistent visual style across all portraits.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '15 days'
FROM objects o WHERE o.public_id = 'mock_object_16' ON CONFLICT DO NOTHING;

-- Object 17: Digital Sculptures (5 iterations)
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Sculpture Design', NOW() - INTERVAL '85 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Designed initial sculpture concepts exploring form and negative space.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '85 days'
FROM objects o WHERE o.public_id = 'mock_object_17' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, '3D Modeling', NOW() - INTERVAL '70 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Created detailed 3D models using sculpting software.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '70 days'
FROM objects o WHERE o.public_id = 'mock_object_17' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Material Development', NOW() - INTERVAL '55 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Developed custom materials and textures for the sculptures.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '55 days'
FROM objects o WHERE o.public_id = 'mock_object_17' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Lighting Setup', NOW() - INTERVAL '40 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Configured advanced lighting setups to highlight form and texture.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '40 days'
FROM objects o WHERE o.public_id = 'mock_object_17' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Final Renders', NOW() - INTERVAL '15 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Completed high-resolution renders showcasing the digital sculptures.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '15 days'
FROM objects o WHERE o.public_id = 'mock_object_17' ON CONFLICT DO NOTHING;

-- Object 18: Interface Poetry (3 iterations)
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Concept Development', NOW() - INTERVAL '60 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Developed concept for poetic UI design exploring expressive forms.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '60 days'
FROM objects o WHERE o.public_id = 'mock_object_18' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Prototype Design', NOW() - INTERVAL '45 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Created interactive prototypes demonstrating poetic interface concepts.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '45 days'
FROM objects o WHERE o.public_id = 'mock_object_18' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Case Studies', NOW() - INTERVAL '20 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Completed case studies showcasing poetic interfaces in different contexts.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '20 days'
FROM objects o WHERE o.public_id = 'mock_object_18' ON CONFLICT DO NOTHING;

-- Object 19: Ephemeral Bonds (4 iterations)
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Interview Series', NOW() - INTERVAL '75 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Conducted interviews exploring digital age relationships.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '75 days'
FROM objects o WHERE o.public_id = 'mock_object_19' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Photo Documentation', NOW() - INTERVAL '60 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Documented subjects through intimate portrait photography.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '60 days'
FROM objects o WHERE o.public_id = 'mock_object_19' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Video Essays', NOW() - INTERVAL '45 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Created video essays combining interviews and visual narratives.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '45 days'
FROM objects o WHERE o.public_id = 'mock_object_19' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Final Assembly', NOW() - INTERVAL '20 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Final assembly of multimedia narrative ready for presentation.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '20 days'
FROM objects o WHERE o.public_id = 'mock_object_19' ON CONFLICT DO NOTHING;

-- Object 20: Quantum Aesthetics (5 iterations)
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Research Phase', NOW() - INTERVAL '90 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Research into quantum physics principles and their visual representation.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '90 days'
FROM objects o WHERE o.public_id = 'mock_object_20' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Visual System Design', NOW() - INTERVAL '75 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Designed visual systems representing quantum phenomena.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '75 days'
FROM objects o WHERE o.public_id = 'mock_object_20' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'VR Environment', NOW() - INTERVAL '60 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Built immersive VR environments visualizing quantum concepts.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '60 days'
FROM objects o WHERE o.public_id = 'mock_object_20' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Interaction Design', NOW() - INTERVAL '45 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Designed interactive elements allowing users to manipulate quantum states.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '45 days'
FROM objects o WHERE o.public_id = 'mock_object_20' ON CONFLICT DO NOTHING;
INSERT INTO iterations (object_id, title, date, description, created_at)
SELECT o.id, 'Final Experience', NOW() - INTERVAL '15 days', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Final VR experience ready for installation and public engagement.", "type": "text"}]}]}'::jsonb, NOW() - INTERVAL '15 days'
FROM objects o WHERE o.public_id = 'mock_object_20' ON CONFLICT DO NOTHING;
