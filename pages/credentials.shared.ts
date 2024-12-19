export { POSTGRES_URI };
const POSTGRES_URI = process.env.NODE_ENV == "development"
    ? "http://localhost:3000/rest"
    : "https://dev.prep50exams.com/rest";
