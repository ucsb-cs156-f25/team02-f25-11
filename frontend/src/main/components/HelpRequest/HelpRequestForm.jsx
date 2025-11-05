import { Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function HelpRequestForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });
  // Stryker restore all

  const navigate = useNavigate();

  // For explanation, see: https://stackoverflow.com/questions/3143070/javascript-regex-iso-datetime
  // Note that even this complex regex may still need some tweaks

  // Stryker disable Regex
  const isodate_regex =
    /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/i;
  // Stryker restore Regex

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Row>
        {initialContents && (
          <Col>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="id">Id</Form.Label>
              <Form.Control
                data-testid="HelpRequestForm-id"
                id="id"
                type="text"
                {...register("id")}
                value={initialContents.id}
                disabled
              />
            </Form.Group>
          </Col>
        )}

        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="requestTime">Date (iso format)</Form.Label>
            <Form.Control
              data-testid="HelpRequestForm-requestTime"
              id="requestTime"
              type="datetime-local"
              isInvalid={Boolean(errors.requestTime)}
              {...register("requestTime", {
                required: true,
                pattern: isodate_regex,
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.requestTime && "requestTime is required. "}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="requesterEmail">Requester Email</Form.Label>
            <Form.Control
              data-testid="HelpRequestForm-requesterEmail"
              id="requesterEmail"
              type="text"
              isInvalid={Boolean(errors.requesterEmail)}
              {...register("requesterEmail", {
                required: "Requester's Email is required.",
                maxLength: {
                  value: 255,
                  message: "Max Email length is 255 characters",
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.requesterEmail?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="teamId">Team ID</Form.Label>
            <Form.Control
              data-testid="HelpRequestForm-teamId"
              id="teamId"
              type="text"
              isInvalid={Boolean(errors.teamId)}
              {...register("teamId", {
                required: "Team ID is required.",
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.teamId?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="tableOrBreakoutRoom">Table or Breakout Room</Form.Label>
            <Form.Control
              data-testid="HelpRequestForm-tableOrBreakoutRoom"
              id="tableOrBreakoutRoom"
              type="text"
              isInvalid={Boolean(errors.tableOrBreakoutRoom)}
              {...register("tableOrBreakoutRoom", {
                required: "Table or Breakout Room is required.",
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.tableOrBreakoutRoom?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="explanation">Explanation</Form.Label>
            <Form.Control
              data-testid="HelpRequestForm-explanation"
              id="explanation"
              type="text"
              isInvalid={Boolean(errors.explanation)}
              {...register("explanation", {
                required: "Explanation is required.",
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.explanation?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="solved">Solved</Form.Label>
            <Form.Select
              data-testid="HelpRequestForm-solved"
              id="solved"
              isInvalid={Boolean(errors.solved)}
              {...register("solved")}
            >
              <option value="false">False</option>
              <option value="true">True</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Button type="submit" data-testid="HelpRequestForm-submit">
            {buttonLabel}
          </Button>
          <Button
            variant="Secondary"
            onClick={() => navigate(-1)}
            data-testid="HelpRequestForm-cancel"
          >
            Cancel
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default HelpRequestForm;
