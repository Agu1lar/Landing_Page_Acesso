-- Ensures guindaste/Munck catalog row exists in Postgres (go-live priority)
INSERT INTO equipment (
  slug,
  name,
  category,
  short_description,
  long_description,
  specs,
  tags,
  featured,
  available,
  published,
  updated_by
) VALUES (
  'guindaste-industrial-munck-remocao-bh',
  'Guindaste industrial, Munck e remoção técnica',
  'guindastes-remocoes',
  'Locação de guindaste industrial, caminhão Munck e remoção técnica em BH.',
  'Solução para içamento, movimentação e transporte de cargas pesadas em Belo Horizonte e região metropolitana. Atende remoção industrial, carga e descarga de materiais, montagem de estruturas, movimentação de máquinas e apoio técnico em operações que exigem planejamento, segurança e equipe especializada.',
  '[{"label":"Aplicações","value":"Remoção industrial, içamento, carga e descarga"},{"label":"Cargas atendidas","value":"Máquinas, estruturas metálicas, geradores e transformadores"},{"label":"Equipamentos","value":"Guindaste industrial e caminhão Munck conforme disponibilidade"},{"label":"Atendimento","value":"Belo Horizonte e região metropolitana"},{"label":"Orçamento","value":"Sob consulta com avaliação da operação"}]'::jsonb,
  '["guindaste","munck","içamento","remoção técnica","carga pesada"]'::jsonb,
  true,
  true,
  true,
  'migration-0007'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  short_description = EXCLUDED.short_description,
  long_description = EXCLUDED.long_description,
  specs = EXCLUDED.specs,
  tags = EXCLUDED.tags,
  featured = EXCLUDED.featured,
  available = true,
  published = true,
  deleted_at = NULL,
  updated_by = EXCLUDED.updated_by,
  updated_at = now();

INSERT INTO equipment_images (equipment_id, url, alt, sort_order, is_primary)
SELECT e.id, '/equipamentos/guindaste-industrial-munck-remocao-bh.png', e.name, 0, true
FROM equipment e
WHERE e.slug = 'guindaste-industrial-munck-remocao-bh'
  AND NOT EXISTS (
    SELECT 1 FROM equipment_images ei WHERE ei.equipment_id = e.id AND ei.is_primary = true
  );
