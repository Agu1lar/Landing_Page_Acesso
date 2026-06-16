-- Reorganize equipment catalog into seven business categories.
UPDATE "equipment"
SET "category" = 'plataformas-elevatorias', "updated_at" = NOW()
WHERE "category" = 'equipamentos-aereos';

UPDATE "equipment"
SET "category" = 'guindaste-industrial', "updated_at" = NOW()
WHERE "category" IN ('guindastes-remocoes', 'outros');

UPDATE "equipment"
SET "category" = 'andaimes', "updated_at" = NOW()
WHERE "category" = 'andaimes-acesso';

UPDATE "equipment"
SET "category" = 'ferramentas-eletricas', "updated_at" = NOW()
WHERE "category" IN ('concretagem', 'demolicao-perfuracao');

UPDATE "equipment"
SET "category" = 'ferramentas-combustao', "updated_at" = NOW()
WHERE "slug" IN (
  'cortadora-de-piso-gasolina',
  'gerador-a-gasolina',
  'placa-vibratoria-gasolina',
  'rocadeira'
);

UPDATE "equipment"
SET "category" = 'ferramentas-bateria', "updated_at" = NOW()
WHERE "slug" IN ('carregador', 'bateria');

UPDATE "equipment"
SET "category" = 'ferramentas-eletricas', "updated_at" = NOW()
WHERE "category" IN ('compactacao', 'energia', 'ferramentas-eletricas')
  AND "slug" NOT IN (
    'cortadora-de-piso-gasolina',
    'gerador-a-gasolina',
    'placa-vibratoria-gasolina',
    'rocadeira',
    'carregador',
    'bateria'
  );
