-- Add up migration script here
-- TOPIC & OBJECTIVE CONSTRAIN
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find the name of the foreign key constraint
    SELECT
        conname INTO constraint_name
    FROM
        pg_constraint
    WHERE
        conrelid = 'public.topic_objectives'::regclass
        AND confrelid IS NOT NULL
        AND conkey @> ARRAY[(
            SELECT
                attnum
            FROM
                pg_attribute
            WHERE
                attrelid = 'public.topic_objectives'::regclass
                AND attname = 'topic_id')];
    -- Drop the existing foreign key constraint if it exists
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.topic_objectives DROP CONSTRAINT ' || quote_ident(constraint_name);
        -- Add a new foreign key constraint with ON DELETE CASCADE using the original constraint name
        EXECUTE 'ALTER TABLE public.topic_objectives
                 ADD CONSTRAINT ' || quote_ident(constraint_name) || ' FOREIGN KEY (topic_id)
                 REFERENCES public.topics (id) ON DELETE CASCADE';
    END IF;
END
$$;

DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find the name of the foreign key constraint
    SELECT
        conname INTO constraint_name
    FROM
        pg_constraint
    WHERE
        conrelid = 'public.topic_objectives'::regclass
        AND confrelid IS NOT NULL
        AND conkey @> ARRAY[(
            SELECT
                attnum
            FROM
                pg_attribute
            WHERE
                attrelid = 'public.topic_objectives'::regclass
                AND attname = 'objective_id')];
    -- Drop the existing foreign key constraint if it exists
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.topic_objectives DROP CONSTRAINT ' || quote_ident(constraint_name);
        -- Add a new foreign key constraint with ON DELETE CASCADE using the original constraint name
        EXECUTE 'ALTER TABLE public.topic_objectives
                 ADD CONSTRAINT ' || quote_ident(constraint_name) || ' FOREIGN KEY (objective_id)
                 REFERENCES public.objectives (id) ON DELETE CASCADE';
    END IF;
END
$$;

-- OBJECTIVE & LESSON constrain
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find the name of the foreign key constraint
    SELECT
        conname INTO constraint_name
    FROM
        pg_constraint
    WHERE
        conrelid = 'public.objective_lessons'::regclass
        AND confrelid IS NOT NULL
        AND conkey @> ARRAY[(
            SELECT
                attnum
            FROM
                pg_attribute
            WHERE
                attrelid = 'public.objective_lessons'::regclass
                AND attname = 'objective_id')];
    -- Drop the existing foreign key constraint if it exists
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.objective_lessons DROP CONSTRAINT ' || quote_ident(constraint_name);
        -- Add a new foreign key constraint with ON DELETE CASCADE using the original constraint name
        EXECUTE 'ALTER TABLE public.objective_lessons
                 ADD CONSTRAINT ' || quote_ident(constraint_name) || ' FOREIGN KEY (objective_id)
                 REFERENCES public.objectives (id) ON DELETE CASCADE';
    END IF;
END
$$;

DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find the name of the foreign key constraint
    SELECT
        conname INTO constraint_name
    FROM
        pg_constraint
    WHERE
        conrelid = 'public.objective_lessons'::regclass
        AND confrelid IS NOT NULL
        AND conkey @> ARRAY[(
            SELECT
                attnum
            FROM
                pg_attribute
            WHERE
                attrelid = 'public.objective_lessons'::regclass
                AND attname = 'lesson_id')];
    -- Drop the existing foreign key constraint if it exists
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.objective_lessons DROP CONSTRAINT ' || quote_ident(constraint_name);
        -- Add a new foreign key constraint with ON DELETE CASCADE using the original constraint name
        EXECUTE 'ALTER TABLE public.objective_lessons
                 ADD CONSTRAINT ' || quote_ident(constraint_name) || ' FOREIGN KEY (lesson_id)
                 REFERENCES public.lessons (id) ON DELETE CASCADE';
    END IF;
END
$$;

-- OBJECTIVE & QUESTION constrain
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find the name of the foreign key constraint
    SELECT
        conname INTO constraint_name
    FROM
        pg_constraint
    WHERE
        conrelid = 'public.objective_questions'::regclass
        AND confrelid IS NOT NULL
        AND conkey @> ARRAY[(
            SELECT
                attnum
            FROM
                pg_attribute
            WHERE
                attrelid = 'public.objective_questions'::regclass
                AND attname = 'objective_id')];
    -- Drop the existing foreign key constraint if it exists
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.objective_questions DROP CONSTRAINT ' || quote_ident(constraint_name);
        -- Add a new foreign key constraint with ON DELETE CASCADE using the original constraint name
        EXECUTE 'ALTER TABLE public.objective_questions
                 ADD CONSTRAINT ' || quote_ident(constraint_name) || ' FOREIGN KEY (objective_id)
                 REFERENCES public.objectives (id) ON DELETE CASCADE';
    END IF;
END
$$;

DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find the name of the foreign key constraint
    SELECT
        conname INTO constraint_name
    FROM
        pg_constraint
    WHERE
        conrelid = 'public.objective_questions'::regclass
        AND confrelid IS NOT NULL
        AND conkey @> ARRAY[(
            SELECT
                attnum
            FROM
                pg_attribute
            WHERE
                attrelid = 'public.objective_questions'::regclass
                AND attname = 'question_id')];
    -- Drop the existing foreign key constraint if it exists
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.objective_questions DROP CONSTRAINT ' || quote_ident(constraint_name);
        -- Add a new foreign key constraint with ON DELETE CASCADE using the original constraint name
        EXECUTE 'ALTER TABLE public.objective_questions
                 ADD CONSTRAINT ' || quote_ident(constraint_name) || ' FOREIGN KEY (question_id)
                 REFERENCES public.questions (id) ON DELETE CASCADE';
    END IF;
END
$$;
