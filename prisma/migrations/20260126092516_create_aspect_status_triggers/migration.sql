-- ============================================================================
-- OPTIMIZED Aspect Status Triggers with Performance Enhancements
-- ============================================================================

-- Performance Indexes
CREATE INDEX IF NOT EXISTS "AspectPillar_pillar_id_idx" ON "public"."AspectPillar"("pillar_id");
CREATE INDEX IF NOT EXISTS "AspectPillar_aspect_id_idx" ON "public"."AspectPillar"("aspect_id");
CREATE INDEX IF NOT EXISTS "PillarFramework_pillar_id_idx" ON "public"."PillarFramework"("pillar_id");
CREATE INDEX IF NOT EXISTS "PillarFramework_framework_id_idx" ON "public"."PillarFramework"("framework_id");
CREATE INDEX IF NOT EXISTS "CompetencyAspectAssessmentMethod_competency_aspect_id_idx" ON "public"."CompetencyAspectAssessmentMethod"("competency_aspect_id");
CREATE INDEX IF NOT EXISTS "CompetencyAspect_status_idx" ON "public"."CompetencyAspect"("status");

-- ============================================================================
-- CORE FUNCTION: Recalculate Single Aspect Status (Row-Level)
-- ============================================================================
CREATE OR REPLACE FUNCTION recalculate_aspect_status(aspect_id_uuid uuid)
RETURNS VOID AS $$
DECLARE
    has_method BOOLEAN;
    has_framework BOOLEAN;
    current_status "CompetencyAspectStatus";
    new_status "CompetencyAspectStatus";
BEGIN
    -- Single query to get both checks + current status (OPTIMIZED)
    SELECT 
        EXISTS (
            SELECT 1 FROM "CompetencyAspectAssessmentMethod" 
            WHERE competency_aspect_id = aspect_id_uuid
        ),
        EXISTS (
            SELECT 1 
            FROM "AspectPillar" ap
            JOIN "PillarFramework" pf ON ap.pillar_id = pf.pillar_id
            WHERE ap.aspect_id = aspect_id_uuid
        ),
        ca.status
    INTO has_method, has_framework, current_status
    FROM "CompetencyAspect" ca
    WHERE ca.id = aspect_id_uuid;

    -- Determine new status
    IF has_method AND has_framework THEN
        new_status := 'REFERENCED';
    ELSIF has_method THEN
        new_status := 'AVAILABLE';
    ELSE
        new_status := 'DRAFT';
    END IF;

    -- Only update if status actually changes (OPTIMIZED)
    -- AND ONLY if it follows the status rules (Quality Gate)
    IF current_status != new_status THEN
        -- Apply upgrade/downgrade rules
        -- Rule: DRAFT NEVER auto-upgrades.
        -- Only AVAILABLE can auto-upgrade to REFERENCED.
        -- REFERENCED can auto-downgrade to AVAILABLE or DRAFT.
        -- AVAILABLE can auto-downgrade to DRAFT.
        IF (current_status = 'REFERENCED' AND new_status IN ('AVAILABLE', 'DRAFT')) OR
           (current_status = 'AVAILABLE' AND new_status = 'DRAFT') OR
           (current_status = 'AVAILABLE' AND new_status = 'REFERENCED') THEN
            UPDATE "CompetencyAspect" SET status = new_status WHERE id = aspect_id_uuid;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- BATCH FUNCTION: Recalculate Multiple Aspects (Set-Based)
-- ============================================================================
CREATE OR REPLACE FUNCTION recalculate_aspect_status_batch(aspect_ids uuid[])
RETURNS VOID AS $$
BEGIN
    -- Set-based update for better performance
    -- This handles the logic where DRAFT stays DRAFT (Quality Gate)
    UPDATE "CompetencyAspect" ca
    SET status = (
        CASE 
            WHEN EXISTS (SELECT 1 FROM "CompetencyAspectAssessmentMethod" WHERE competency_aspect_id = ca.id) 
                 AND EXISTS (
                    SELECT 1 
                    FROM "AspectPillar" ap 
                    JOIN "PillarFramework" pf ON ap.pillar_id = pf.pillar_id 
                    WHERE ap.aspect_id = ca.id
                 )
            THEN 'REFERENCED'::"CompetencyAspectStatus"
            
            WHEN EXISTS (SELECT 1 FROM "CompetencyAspectAssessmentMethod" WHERE competency_aspect_id = ca.id)
            THEN 'AVAILABLE'::"CompetencyAspectStatus"
            
            ELSE 'DRAFT'::"CompetencyAspectStatus"
        END
    )
    WHERE ca.id = ANY(aspect_ids)
      -- Only update if status will actually change
      AND ca.status != (
        CASE 
            WHEN EXISTS (SELECT 1 FROM "CompetencyAspectAssessmentMethod" WHERE competency_aspect_id = ca.id) 
                 AND EXISTS (
                    SELECT 1 
                    FROM "AspectPillar" ap 
                    JOIN "PillarFramework" pf ON ap.pillar_id = pf.pillar_id 
                    WHERE ap.aspect_id = ca.id
                 )
            THEN 'REFERENCED'::"CompetencyAspectStatus"
            WHEN EXISTS (SELECT 1 FROM "CompetencyAspectAssessmentMethod" WHERE competency_aspect_id = ca.id)
            THEN 'AVAILABLE'::"CompetencyAspectStatus"
            ELSE 'DRAFT'::"CompetencyAspectStatus"
        END
      )
      -- Apply Quality Gate: Only upgrade if current is NOT DRAFT
      AND (
        (ca.status = 'REFERENCED') OR
        (ca.status = 'AVAILABLE')
      );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER FUNCTION: CompetencyAspectAssessmentMethod
-- ============================================================================
CREATE OR REPLACE FUNCTION trg_func_aspect_method_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        PERFORM recalculate_aspect_status(OLD.competency_aspect_id);
        RETURN OLD;
    ELSIF (TG_OP = 'INSERT') THEN
        PERFORM recalculate_aspect_status(NEW.competency_aspect_id);
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- If record moved between aspects, recalculate both
        IF OLD.competency_aspect_id <> NEW.competency_aspect_id THEN
            PERFORM recalculate_aspect_status(OLD.competency_aspect_id);
            PERFORM recalculate_aspect_status(NEW.competency_aspect_id);
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_status_on_method_change ON "CompetencyAspectAssessmentMethod";
CREATE TRIGGER trg_check_status_on_method_change
AFTER INSERT OR UPDATE OR DELETE ON "CompetencyAspectAssessmentMethod"
FOR EACH ROW
EXECUTE FUNCTION trg_func_aspect_method_change();

-- ============================================================================
-- TRIGGER FUNCTION: AspectPillar
-- ============================================================================
CREATE OR REPLACE FUNCTION trg_func_aspect_pillar_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        PERFORM recalculate_aspect_status(OLD.aspect_id);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Only recalculate if pillar_id or aspect_id changed
        IF OLD.pillar_id <> NEW.pillar_id OR OLD.aspect_id <> NEW.aspect_id THEN
            PERFORM recalculate_aspect_status(NEW.aspect_id);
            PERFORM recalculate_aspect_status(OLD.aspect_id);
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        PERFORM recalculate_aspect_status(NEW.aspect_id);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_status_on_pillar_change ON "AspectPillar";
CREATE TRIGGER trg_check_status_on_pillar_change
AFTER DELETE OR UPDATE OR INSERT ON "AspectPillar"
FOR EACH ROW
EXECUTE FUNCTION trg_func_aspect_pillar_change();

-- ============================================================================
-- TRIGGER FUNCTION: PillarFramework (Set-Based)
-- ============================================================================
CREATE OR REPLACE FUNCTION trg_func_pillar_framework_change()
RETURNS TRIGGER AS $$
DECLARE
    affected_aspect_ids uuid[];
BEGIN
    IF (TG_OP = 'DELETE') THEN
        -- Get all affected aspect IDs first
        SELECT ARRAY_AGG(DISTINCT aspect_id) INTO affected_aspect_ids
        FROM "AspectPillar"
        WHERE pillar_id = OLD.pillar_id;

        IF affected_aspect_ids IS NOT NULL AND array_length(affected_aspect_ids, 1) > 0 THEN
            PERFORM recalculate_aspect_status_batch(affected_aspect_ids);
        END IF;
        RETURN OLD;

    ELSIF (TG_OP = 'INSERT') THEN
        -- Get all affected aspect IDs
        SELECT ARRAY_AGG(DISTINCT aspect_id) INTO affected_aspect_ids
        FROM "AspectPillar"
        WHERE pillar_id = NEW.pillar_id;

        -- Batch upgrade for UPGRADE: AVAILABLE -> REFERENCED
        -- (DRAFT is handled by the batch function's Quality Gate)
        IF affected_aspect_ids IS NOT NULL AND array_length(affected_aspect_ids, 1) > 0 THEN
            UPDATE "CompetencyAspect" ca
            SET status = 'REFERENCED'::"CompetencyAspectStatus"
            WHERE ca.id = ANY(affected_aspect_ids)
              AND ca.status = 'AVAILABLE'
              AND EXISTS (
                SELECT 1 FROM "CompetencyAspectAssessmentMethod" 
                WHERE competency_aspect_id = ca.id
              );
        END IF;
        RETURN NEW;

    ELSIF (TG_OP = 'UPDATE') THEN
        -- If framework link moved between pillars
        IF OLD.pillar_id <> NEW.pillar_id THEN
            -- Old pillar's aspects
            SELECT ARRAY_AGG(DISTINCT aspect_id) INTO affected_aspect_ids
            FROM "AspectPillar" WHERE pillar_id = OLD.pillar_id;
            IF affected_aspect_ids IS NOT NULL AND array_length(affected_aspect_ids, 1) > 0 THEN
                PERFORM recalculate_aspect_status_batch(affected_aspect_ids);
            END IF;
            
            -- New pillar's aspects
            SELECT ARRAY_AGG(DISTINCT aspect_id) INTO affected_aspect_ids
            FROM "AspectPillar" WHERE pillar_id = NEW.pillar_id;
            IF affected_aspect_ids IS NOT NULL AND array_length(affected_aspect_ids, 1) > 0 THEN
                PERFORM recalculate_aspect_status_batch(affected_aspect_ids);
            END IF;
        ELSIF OLD.framework_id <> NEW.framework_id THEN
            -- Framework ID changed - still need to check all aspects under this pillar
            SELECT ARRAY_AGG(DISTINCT aspect_id) INTO affected_aspect_ids
            FROM "AspectPillar" WHERE pillar_id = NEW.pillar_id;
            IF affected_aspect_ids IS NOT NULL AND array_length(affected_aspect_ids, 1) > 0 THEN
                PERFORM recalculate_aspect_status_batch(affected_aspect_ids);
            END IF;
        END IF;
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_status_on_framework_pillar_change ON "PillarFramework";
CREATE TRIGGER trg_check_status_on_framework_pillar_change
AFTER INSERT OR UPDATE OR DELETE ON "PillarFramework"
FOR EACH ROW
EXECUTE FUNCTION trg_func_pillar_framework_change();

-- ============================================================================
-- COMMENTS & DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION recalculate_aspect_status(uuid) IS 
'Recalculates aspect status for a single aspect. Status rules follow the Quality Gate principle where DRAFT never auto-upgrades.
Only manually approved AVAILABLE/REFERENCED aspects auto-transition.';

COMMENT ON FUNCTION recalculate_aspect_status_batch(uuid[]) IS
'Batch recalculation for multiple aspects. Respects Quality Gate rules.';