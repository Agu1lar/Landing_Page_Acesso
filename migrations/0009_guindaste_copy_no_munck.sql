-- Updates guindaste catalog copy: remove Munck/talhas from public-facing text (slug unchanged for redirects)
UPDATE equipment
SET
  name = 'Locação de guindaste industrial e remoção técnica',
  short_description = 'Locação de guindaste industrial e remoção técnica em BH.',
  long_description = 'Solução para içamento, movimentação e transporte de cargas pesadas em Belo Horizonte e região metropolitana. Atende remoção industrial, carga e descarga de materiais, montagem de estruturas, movimentação de máquinas e apoio técnico em operações que exigem planejamento, segurança e equipe especializada.',
  specs = '[{"label":"Aplicações","value":"Remoção industrial, içamento, carga e descarga"},{"label":"Cargas atendidas","value":"Máquinas, estruturas metálicas, geradores e transformadores"},{"label":"Equipamentos","value":"Guindaste industrial conforme disponibilidade da operação"},{"label":"Atendimento","value":"Região metropolitana de BH e operações nacionais sob consulta"},{"label":"Orçamento","value":"Sob consulta com avaliação da operação"}]'::jsonb,
  tags = '["guindaste","içamento","remoção técnica","carga pesada"]'::jsonb,
  updated_by = 'migration-0009',
  updated_at = now()
WHERE slug = 'guindaste-industrial-munck-remocao-bh';

UPDATE equipment
SET
  available = false,
  updated_by = 'migration-0009',
  updated_at = now()
WHERE slug = 'talha-1t';
