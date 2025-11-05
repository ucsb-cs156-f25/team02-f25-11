import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function RecommendationRequestForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({ defaultValues: initialContents || {} });
  // Stryker restore all

  const navigate = useNavigate();
  const testIdPrefix = "RecommendationRequestForm";

  const dateRequested = watch("dateRequested");

  return (
    <Form noValidate onSubmit={handleSubmit(submitAction)}>
      {initialContents && (
        <Form.Group className="mb-3">
          <Form.Label htmlFor="id">Id</Form.Label>
          <Form.Control
            data-testid={testIdPrefix + "-id"}
            id="id"
            type="text"
            {...register("id")}
            value={initialContents.id}
            disabled
          />
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label htmlFor="requesterEmail">Requester Email</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-requesterEmail"}
          id="requesterEmail"
          type="email"
          isInvalid={Boolean(errors.requesterEmail)}
          {...register("requesterEmail", {
            required: "Requester email is required.",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
            maxLength: { value: 254, message: "Max length 254 characters" },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.requesterEmail?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="professorEmail">Professor Email</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-professorEmail"}
          id="professorEmail"
          type="email"
          isInvalid={Boolean(errors.professorEmail)}
          {...register("professorEmail", {
            required: "Professor email is required.",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
            maxLength: { value: 254, message: "Max length 254 characters" },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.professorEmail?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="explanation">Explanation</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-explanation"}
          id="explanation"
          as="textarea"
          rows={3}
          isInvalid={Boolean(errors.explanation)}
          {...register("explanation", {
            required: "Explanation is required.",
            maxLength: { value: 2000, message: "Max length 2000 characters" },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.explanation?.message}
        </Form.Control.Feedback>
      </Form.Group>

      {/* LocalDateTime fields -> use datetime-local */}
      <Form.Group className="mb-3">
        <Form.Label htmlFor="dateRequested">Date Requested</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-dateRequested"}
          id="dateRequested"
          type="datetime-local"
          isInvalid={Boolean(errors.dateRequested)}
          {...register("dateRequested", {
            required: "Date requested is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.dateRequested?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="dateNeeded">Date Needed</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-dateNeeded"}
          id="dateNeeded"
          type="datetime-local"
          isInvalid={Boolean(errors.dateNeeded)}
          {...register("dateNeeded", {
            required: "Date needed is required.",
            validate: (value) => {
              // simple compare as strings if both are in 'YYYY-MM-DDTHH:mm' form
              // Stryker disable next-line ConditionalExpression, LogicalOperator, BooleanLiteral: guard clause must short-circuit when either is empty
              if (!dateRequested || !value) return true;
              return (
                value >= dateRequested ||
                "Date needed must be after or equal to date requested."
              );
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.dateNeeded?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check
          data-testid={testIdPrefix + "-done"}
          id="done"
          type="checkbox"
          label="Done"
          {...register("done")}
        />
      </Form.Group>

      <Button type="submit" data-testid={testIdPrefix + "-submit"}>
        {buttonLabel}
      </Button>
      <Button
        variant="Secondary"
        onClick={() => navigate(-1)}
        data-testid={testIdPrefix + "-cancel"}
        className="ms-2"
      >
        Cancel
      </Button>
    </Form>
  );
}

export default RecommendationRequestForm;
