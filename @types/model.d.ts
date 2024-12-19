interface User {}

type Tag = "J" | "W" | "JW";
interface Subject {
    id: number;
    name: string;
    tag: Tag;
}

interface Topic {
    id: number;
    title: string;
    tag: Tag;
}

interface Objective {
    id: number;
    title: string;
    details: string;
    tag: Tag;
}

interface Lesson {
    id: number;
    title: string;
    tag: Tag;
    content: string;
}

type QuestionOption = "option_1" | "option_2" | "option_3" | "option_4";
interface Question {
    id: number;
    subject_id: number;
    question_type_id: 1 | 2 | 3;
    question: string;
    question_details: string;
    question_image: NullString;
    option_1: string;
    option_2: string;
    option_3: string;
    option_4: string;
    short_answer: QuestionOption;
    full_answer: string;
    answer_image: NullString;
    answer_details: string;
    passage: string;
    tag: Tag;
}
