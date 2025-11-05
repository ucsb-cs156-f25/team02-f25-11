import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router";
import RecommendationRequestForm from "main/components/RecommendationRequests/RecommendationRequestForm";
import { Navigate } from "react-router";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function RecommendationRequestsEditPage({ storybook = false }) {
  let { id } = useParams();

  const {
    data: request,
    _error,
    _status,
  } = useBackend(
    [`/api/recommendationrequests?id=${id}`],
    {
      method: "GET",
      url: `/api/recommendationrequests`,
      params: {
        id,
      },
    },
  );

  const objectToAxiosPutParams = (req) => ({
    url: "/api/recommendationrequests",
    method: "PUT",
    params: {
      id: req.id,
    },
    data: {
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
      `Recommendation Request Updated - id: ${saved.id} requester: ${saved.requesterEmail}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    [`/api/recommendationrequests?id=${id}`],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/recommendationrequests" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Recommendation Request</h1>
        {request && (
          <RecommendationRequestForm
            initialContents={request}
            submitAction={onSubmit}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}


