-- Add up migration script here
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subjects TO authenticated;

GRANT USAGE, SELECT ON SEQUENCE public.subjects_id_seq
    TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.topics TO authenticated;

GRANT USAGE, SELECT ON SEQUENCE public.topics_id_seq
    TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.topic_objectives TO authenticated;

GRANT USAGE, SELECT ON SEQUENCE public.topic_objectives_id_seq
    TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.objectives TO authenticated;

GRANT USAGE, SELECT ON SEQUENCE public.objectives_id_seq
    TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO authenticated;

GRANT USAGE, SELECT ON SEQUENCE public.lessons_id_seq
    TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.objective_lessons TO authenticated;

GRANT USAGE, SELECT ON SEQUENCE public.objective_lessons_id_seq
    TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.questions TO authenticated;

GRANT USAGE, SELECT ON SEQUENCE public.questions_id_seq
    TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.objective_questions TO authenticated;

GRANT USAGE, SELECT ON SEQUENCE public.objective_questions_id_seq
    TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.podcasts TO authenticated;
