import { Link } from "../../../components/Link";

export default function () {
  return (
    <div className="h-full max-w-screen-sm flex flex-col place-items-center py-8 gap-4">
      <Link href="/collections/subjects">
        Subjects
      </Link>
      <Link href="/collections/podcasts">
        Podcast
      </Link>
      <Link href="/collections/faqs">
        Faqs
      </Link>
      <Link href="/collections/newsfeeds">
        Newsfeed
      </Link>
    </div>
  );
}
