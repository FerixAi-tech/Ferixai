-- Sync campaign wizard categories with the updated UK local business list.
-- Cascades to bone_questions (FK on category_id).

TRUNCATE public.categories CASCADE;

INSERT INTO public.categories (name, slug) VALUES
  ('Florist & Gift Shop', 'florist-gift-shop'),
  ('E-commerce', 'e-commerce'),
  ('Education & Courses', 'education-courses'),
  ('Real Estate & Property', 'real-estate-property'),
  ('Events & Organization', 'events-organization'),
  ('Finance & Accounting', 'finance-accounting'),
  ('Photography & Video', 'photography-video'),
  ('Grocery & Food Market', 'grocery-food-market'),
  ('Safety & Security', 'safety-security'),
  ('Beauty & Hair Salon', 'beauty-hair-salon'),
  ('Hardware Store', 'hardware-store'),
  ('Legal & Consulting', 'legal-consulting'),
  ('Construction & Architecture', 'construction-architecture'),
  ('Jewelry & Accessories', 'jewelry-accessories'),
  ('Logistics & Freight', 'logistics-freight'),
  ('Media & Advertising', 'media-advertising'),
  ('Furniture & Decor', 'furniture-decor'),
  ('Automotive', 'automotive'),
  ('Retail & Shop', 'retail-shop'),
  ('Restaurant & Cafe', 'restaurant-cafe'),
  ('Health & Dental Clinic', 'health-dental-clinic'),
  ('Sports & Fitness', 'sports-fitness'),
  ('Technology & Software', 'technology-software'),
  ('Cleaning & Maintenance', 'cleaning-maintenance'),
  ('Tourism & Hotel', 'tourism-hotel'),
  ('Veterinary Clinic', 'veterinary-clinic'),
  ('Manufacturing', 'manufacturing');
