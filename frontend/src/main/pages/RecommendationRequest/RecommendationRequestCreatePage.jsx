import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import RecommendationRequestForm from "main/components/RecommendationRequests/RecommendationRequestForm";
import { Navigate } from "react-router";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export const RECOMMENDATION_REQUESTS_ALL_KEY = [
  "/api/recommendationrequests/all",
];

export default function RecommendationRequestCreatePage({ storybook = false }) {
  const objectToAxiosParams = (req) => ({
    url: "/api/recommendationrequests/post",
    method: "POST",
    params: {
      requesterEmail: req.requesterEmail,
      professorEmail: req.professorEmail,
      explanation: req.explanation,
      dateRequested: req.dateRequested,
      dateNeeded: req.dateNeeded,
      done: req.done,
    },
  });

  const onSuccess = (saved) => {
    toast(
      `New Recommendation Request Created - id: ${saved.id} requester: ${saved.requesterEmail}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    RECOMMENDATION_REQUESTS_ALL_KEY,
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/recommendationrequest" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Create New Recommendation Request</h1>
        <RecommendationRequestForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}
