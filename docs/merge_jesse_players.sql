-- ======================================================================================
-- MIGRATION SCRIPT: Merge local player "Jesse" to profile-linked player "Jesse"
-- ======================================================================================

DO $$
DECLARE
    old_jesse_id uuid;
    new_jesse_id uuid;
BEGIN
    -- 1. Get the newly created profile-linked "Jesse" (is_profile = true)
    SELECT id INTO new_jesse_id
    FROM public.players
    WHERE name = 'Jesse' AND is_profile = true
    LIMIT 1;

    -- 2. Get the old local manually created "Jesse" (is_profile = false or null)
    SELECT id INTO old_jesse_id
    FROM public.players
    WHERE name = 'Jesse' AND (is_profile = false OR is_profile IS NULL)
    LIMIT 1;

    -- If either cannot be found, abort
    IF new_jesse_id IS NULL THEN
        RAISE NOTICE 'Could not find the new profile-linked "Jesse". Aborting.';
        RETURN;
    END IF;

    IF old_jesse_id IS NULL THEN
        RAISE NOTICE 'Could not find the old local "Jesse". Aborting.';
        RETURN;
    END IF;

    RAISE NOTICE 'Merging Old Jesse (%) into New Profile Jesse (%)', old_jesse_id, new_jesse_id;

    -- 3. Update Decks owned by old Jesse -> new Jesse
    UPDATE public.decks
    SET player_id = new_jesse_id
    WHERE player_id = old_jesse_id;
    RAISE NOTICE 'Updated decks.';

    -- 4. Update Games where old Jesse was the winner -> new Jesse
    UPDATE public.games
    SET winner_id = new_jesse_id
    WHERE winner_id = old_jesse_id;
    RAISE NOTICE 'Updated game winners.';

    -- 5. Update Game Participants where old Jesse played -> new Jesse
    -- Note: If both old and new Jesse somehow played in the *same* game, 
    -- this update might violate the UNIQUE (game_id, player_id) constraint.
    -- Assuming they never played in the exact same game at the same time:
    UPDATE public.game_participants
    SET player_id = new_jesse_id
    WHERE player_id = old_jesse_id;
    RAISE NOTICE 'Updated game participants.';

    -- 6. Finally, permanently delete the old local "Jesse"
    -- Alternatively, if you want soft-delete, change to: UPDATE public.players SET deleted_at = now() WHERE id = old_jesse_id;
    DELETE FROM public.players
    WHERE id = old_jesse_id;
    RAISE NOTICE 'Deleted old local "Jesse" player.';

    RAISE NOTICE 'Migration from old Jesse to profile Jesse complete!';
END;
$$;
