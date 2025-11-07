import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function UCSBOrganizationForm({ initialContents, submitAction, buttonLabel = "Create" }) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });

  const navigate = useNavigate();
  const testIdPrefix = "UCSBOrganizationForm";

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      {/* Organization Code */}
      <Form.Group className="mb-3">
        <Form.Label htmlFor="orgCode">Organization Code</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-orgCode"}
          id="orgCode"
          type="text"
          isInvalid={Boolean(errors.orgCode)}
          {...register("orgCode", {
            required: "Organization Code is required.",
            maxLength: {
              value: 10,
              message: "Max length 10 characters",
            },
          })}
          disabled={Boolean(initialContents)}
        />
        <Form.Control.Feedback type="invalid">
          {errors.orgCode?.message}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Organization Short Translation */}
      <Form.Group className="mb-3">
        <Form.Label htmlFor="orgTranslationShort">Short Translation</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-orgTranslationShort"}
          id="orgTranslationShort"
          type="text"
          isInvalid={Boolean(errors.orgTranslationShort)}
          {...register("orgTranslationShort", {
            required: "Short Translation is required.",
            maxLength: {
              value: 30,
              message: "Max length 30 characters",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.orgTranslationShort?.message}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Organization Full Translation */}
      <Form.Group className="mb-3">
        <Form.Label htmlFor="orgTranslation">Full Translation</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-orgTranslation"}
          id="orgTranslation"
          type="text"
          isInvalid={Boolean(errors.orgTranslation)}
          {...register("orgTranslation", {
            required: "Full Translation is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.orgTranslation?.message}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Inactive Checkbox */}
      <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          id="inactive"
          label="Inactive"
          data-testid={testIdPrefix + "-inactive"}
          {...register("inactive")}
        />
      </Form.Group>

      {/* Buttons */}
      <Button type="submit" data-testid={testIdPrefix + "-submit"}>
        {buttonLabel}
      </Button>
      <Button
        variant="secondary"
        onClick={() => navigate(-1)}
        data-testid={testIdPrefix + "-cancel"}
      >
        Cancel
      </Button>
    </Form>
  );
}

export default UCSBOrganizationForm;