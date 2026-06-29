-- Uppercase equipment names for consistent catalog cards (runs on deploy via db:migrate)
UPDATE equipment
SET name = upper(trim(regexp_replace(name, '\s+', ' ', 'g')))
WHERE trim(name) <> '';
