-- CreateIndex for performance optimization
CREATE INDEX "AspectPillar_pillar_id_idx" ON "public"."AspectPillar"("pillar_id");

-- Function to recalculate Aspect Status
CREATE OR REPLACE FUNCTION recalculate_aspect_status(aspect_id_uuid uuid)
RETURNS VOID AS $$
DECLARE
    has_method BOOLEAN;
    has_pillar BOOLEAN;
    current_status "CompetencyAspectStatus";
    new_status "CompetencyAspectStatus";
BEGIN
    -- Check for Assessment Method
    SELECT EXISTS (
        SELECT 1 FROM "CompetencyAspectAssessmentMethod"
        WHERE competency_aspect_id = aspect_id_uuid
    ) INTO has_method;

    -- Check for Pillar via PillarFramework (Aspect MUST be linked to a Pillar which is linked to a Framework)
    SELECT EXISTS (
        SELECT 1 
        FROM "AspectPillar" ap
        JOIN "PillarFramework" pf ON ap.pillar_id = pf.pillar_id
        WHERE ap.aspect_id = aspect_id_uuid
    ) INTO has_pillar;

    -- Determine new status logic
    IF has_method AND has_pillar THEN
        new_status := 'REFERENCED';
    ELSIF has_method THEN
        new_status := 'AVAILABLE';
    ELSE
        new_status := 'DRAFT';
    END IF;

    -- Get current status
    SELECT status INTO current_status FROM "CompetencyAspect" WHERE id = aspect_id_uuid;

    -- Only downgrade status if current status is higher than new calculated status
    -- Hierarchy: REFERENCED > AVAILABLE > DRAFT
    IF current_status = 'REFERENCED' AND new_status != 'REFERENCED' THEN
        UPDATE "CompetencyAspect" SET status = new_status WHERE id = aspect_id_uuid;
    ELSIF current_status = 'AVAILABLE' AND new_status = 'DRAFT' THEN
        UPDATE "CompetencyAspect" SET status = new_status WHERE id = aspect_id_uuid;
    END IF;
    -- Note: We DO NOT auto-upgrade status here to avoid side effects. 
    -- We only enforce DOWNGRADE if requirements are lost.
    
END;
$$ LANGUAGE plpgsql;

-- Trigger Function: On Method Change
CREATE OR REPLACE FUNCTION trg_func_aspect_method_change()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM recalculate_aspect_status(OLD.competency_aspect_id);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_status_on_method_delete
AFTER DELETE ON "CompetencyAspectAssessmentMethod"
FOR EACH ROW
EXECUTE FUNCTION trg_func_aspect_method_change();

-- Trigger Function: On AspectPillar Change
CREATE OR REPLACE FUNCTION trg_func_aspect_pillar_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        PERFORM recalculate_aspect_status(OLD.aspect_id);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        PERFORM recalculate_aspect_status(NEW.aspect_id);
        IF OLD.aspect_id <> NEW.aspect_id THEN
            PERFORM recalculate_aspect_status(OLD.aspect_id);
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_status_on_pillar_change
AFTER DELETE OR UPDATE ON "AspectPillar"
FOR EACH ROW
EXECUTE FUNCTION trg_func_aspect_pillar_change();

-- Trigger Function: On PillarFramework Change (OPTIMIZED with Set-Based Update)
CREATE OR REPLACE FUNCTION trg_func_pillar_framework_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Optimized: Update ALL affected aspects in a single statement
    -- IMPORTANT: Only DOWNGRADE status when requirements are lost, never auto-upgrade
    UPDATE "CompetencyAspect" ca
    SET status = (
        -- Calculate new status based on current requirements
        CASE 
            -- Has both method AND pillar link -> should be REFERENCED
            WHEN EXISTS (SELECT 1 FROM "CompetencyAspectAssessmentMethod" WHERE competency_aspect_id = ca.id) 
                 AND EXISTS (
                    SELECT 1 
                    FROM "AspectPillar" ap 
                    JOIN "PillarFramework" pf ON ap.pillar_id = pf.pillar_id 
                    WHERE ap.aspect_id = ca.id
                 ) 
            THEN 'REFERENCED'::"CompetencyAspectStatus"
            
            -- Has only method -> should be AVAILABLE
            WHEN EXISTS (SELECT 1 FROM "CompetencyAspectAssessmentMethod" WHERE competency_aspect_id = ca.id) 
            THEN 'AVAILABLE'::"CompetencyAspectStatus"
            
            -- Has nothing -> should be DRAFT
            ELSE 'DRAFT'::"CompetencyAspectStatus"
        END
    )
    WHERE ca.id IN (
        SELECT aspect_id FROM "AspectPillar" WHERE pillar_id = OLD.pillar_id
    )
    -- Only downgrade: current_status must be higher than new calculated status
    -- Hierarchy: REFERENCED (2) > AVAILABLE (1) > DRAFT (0)
    AND (
        -- REFERENCED -> (AVAILABLE or DRAFT): Always downgrade if requirements lost
        (ca.status = 'REFERENCED' 
         AND NOT EXISTS (
            SELECT 1 
            FROM "AspectPillar" ap 
            JOIN "PillarFramework" pf ON ap.pillar_id = pf.pillar_id 
            WHERE ap.aspect_id = ca.id
         ))
        OR
        -- AVAILABLE -> DRAFT: Downgrade if method lost
        (ca.status = 'AVAILABLE' 
         AND NOT EXISTS (SELECT 1 FROM "CompetencyAspectAssessmentMethod" WHERE competency_aspect_id = ca.id)
         AND NOT EXISTS (
            SELECT 1 
            FROM "AspectPillar" ap 
            JOIN "PillarFramework" pf ON ap.pillar_id = pf.pillar_id 
            WHERE ap.aspect_id = ca.id
         ))
    );

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_status_on_framework_pillar_delete
AFTER DELETE ON "PillarFramework"
FOR EACH ROW
EXECUTE FUNCTION trg_func_pillar_framework_change();