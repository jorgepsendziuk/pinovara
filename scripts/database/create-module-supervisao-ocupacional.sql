-- ============================================
-- Criar módulo e roles para Supervisão Ocupacional
-- ============================================

-- Criar módulo
INSERT INTO pinovara.modules (name, description, active, "createdAt", "updatedAt")
VALUES ('supervisao_ocupacional', 'Supervisão Ocupacional - Gestão de Assentamentos e Famílias', true, NOW(), NOW())
ON CONFLICT (name) DO UPDATE 
SET description = 'Supervisão Ocupacional - Gestão de Assentamentos e Famílias',
    active = true,
    "updatedAt" = NOW();

-- Criar roles do módulo
DO $$
DECLARE
    module_id INT;
BEGIN
    -- Obter ID do módulo
    SELECT id INTO module_id FROM pinovara.modules WHERE name = 'supervisao_ocupacional';

    -- Role: admin
    INSERT INTO pinovara.roles (name, description, "moduleId", active, "createdAt", "updatedAt")
    VALUES ('admin', 'Administrador do módulo de Supervisão Ocupacional', module_id, true, NOW(), NOW())
    ON CONFLICT (name, "moduleId") DO UPDATE 
    SET description = 'Administrador do módulo de Supervisão Ocupacional',
        active = true,
        "updatedAt" = NOW();

    -- Role: coordenador
    INSERT INTO pinovara.roles (name, description, "moduleId", active, "createdAt", "updatedAt")
    VALUES ('coordenador', 'Coordenador de Supervisão Ocupacional', module_id, true, NOW(), NOW())
    ON CONFLICT (name, "moduleId") DO UPDATE 
    SET description = 'Coordenador de Supervisão Ocupacional',
        active = true,
        "updatedAt" = NOW();

    -- Role: tecnico
    INSERT INTO pinovara.roles (name, description, "moduleId", active, "createdAt", "updatedAt")
    VALUES ('tecnico', 'Técnico de Supervisão Ocupacional', module_id, true, NOW(), NOW())
    ON CONFLICT (name, "moduleId") DO UPDATE 
    SET description = 'Técnico de Supervisão Ocupacional',
        active = true,
        "updatedAt" = NOW();

    -- Role: estagiario
    INSERT INTO pinovara.roles (name, description, "moduleId", active, "createdAt", "updatedAt")
    VALUES ('estagiario', 'Estagiário de Supervisão Ocupacional', module_id, true, NOW(), NOW())
    ON CONFLICT (name, "moduleId") DO UPDATE 
    SET description = 'Estagiário de Supervisão Ocupacional',
        active = true,
        "updatedAt" = NOW();
END $$;

-- Verificar criação
SELECT 
    m.name as modulo,
    r.name as role,
    r.description,
    r.active
FROM pinovara.modules m
LEFT JOIN pinovara.roles r ON r."moduleId" = m.id
WHERE m.name = 'supervisao_ocupacional'
ORDER BY r.name;
