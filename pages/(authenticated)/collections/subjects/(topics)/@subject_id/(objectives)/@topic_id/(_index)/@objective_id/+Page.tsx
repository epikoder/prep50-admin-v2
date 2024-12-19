import { usePageContext } from "vike-react/usePageContext";
import RippleButton from "../../../../../../../../../../components/RippleButton";
import { navigate } from "vike/client/router";

export default function () {
    const context = usePageContext();
    const subject_id = context.routeParams.subject_id;
    const topic_id = context.routeParams.topic_id;
    const objective_id = context.routeParams.objective_id;

    return (
        <div className="flex w-full max-w-screen-md p-12 gap-12 text-sm">
            <RippleButton>
                <button
                    className="bg-green-500 px-4 py-1 rounded-md text-white text-xs"
                    onClick={() =>
                        navigate(
                            `/collections/subjects/${subject_id}/${topic_id}/lessons/${objective_id}`,
                        )}
                >
                    Lessons
                </button>
            </RippleButton>
            <RippleButton>
                <button
                    className="bg-green-500 px-4 py-1 rounded-md text-white text-xs"
                    onClick={() =>
                        navigate(
                            `/collections/subjects/${subject_id}/${topic_id}/questions/${objective_id}`,
                        )}
                >
                    Questions
                </button>
            </RippleButton>
        </div>
    );
}
