-- Add up migration script here
CREATE OR REPLACE VIEW public.objectives_view AS
SELECT
    obj.*,
    tobj.topic_id
FROM
    objectives obj
    LEFT JOIN topic_objectives tobj ON tobj.objective_id = obj.id;
GRANT SELECT ON public.objectives_view to authenticated;

CREATE OR REPLACE VIEW public.lesson_view AS
SELECT
    l.*,
    ol.objective_id
FROM
    lessons l
    LEFT JOIN objective_lessons ol ON ol.lesson_id = l.id;
GRANT SELECT ON public.lesson_view to authenticated;

CREATE OR REPLACE VIEW public.question_view AS
SELECT
    q.*,
    oq.objective_id
FROM
    questions q
    LEFT JOIN objective_questions oq ON oq.question_id = q.id;
GRANT SELECT ON public.question_view to authenticated;