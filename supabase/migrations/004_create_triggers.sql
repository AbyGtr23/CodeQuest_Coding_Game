CREATE OR REPLACE FUNCTION check_max_active_tools()
RETURNS TRIGGER AS $$
DECLARE
    active_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO active_count
    FROM user_tools
    WHERE user_id = NEW.user_id AND status = 'active';

    IF active_count >= 2 AND NEW.status = 'active' THEN
        IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != 'active') THEN
            RAISE EXCEPTION 'User cannot have more than 2 active tools';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_max_active_tools
BEFORE INSERT OR UPDATE ON user_tools
FOR EACH ROW
EXECUTE FUNCTION check_max_active_tools();
