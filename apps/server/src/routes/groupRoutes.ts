import {
  CreateGroupBody,
  EditGroupBody,
  ErrorTypes,
  groupDTO,
  groupMemberDTO,
  SimpleIdParam,
  SimpleUsernameParam,
  StatusError,
  StatusOK,
  groupEventDTO,
  planDTO,
  preferenceDTO,
  groupPreferenceReportDTO,
  CreateEventBody,
  EditEventBody,
  CreatePlanBody,
  EditPlanBody,
  CreatePreferenceBody,
  ResolveTieBody,
  groupCalendarDTO,
  eventConfirmationDTO,
  UpdateMemberRoleBody,
} from "@baza/shared-types";
import { Type, type TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyPluginAsync } from "fastify";
import {
  createGroupHandler,
  deleteGroupHandler,
  editGroupHandler,
  editGroupPhotoHandler,
  getGroupByIdHandler,
  getGroupMembersHandler,
  getGroupPhotoHandler,
  inviteUsersToGroupHandler,
  removeUserFromGroupHandler,
  updateUserGroupRoleHandler,
} from "../handlers/groupHandlers";
import {
  createGroupEventHandler,
  getGroupEventsHandler,
  getGroupEventByIdHandler,
  editGroupEventHandler,
  resolveTieHandler,
  getGroupCalendarHandler,
} from "../handlers/eventHandlers";
import {
  createEventPlanHandler,
  getEventPlansHandler,
  getEventPlanByIdHandler,
  editEventPlanHandler,
  voteEventPlanHandler,
  removeVoteEventPlanHandler,
} from "../handlers/planHandlers";
import {
  createOrEditEventPreferenceHandler,
  getEventPreferenceByUsernameHandler,
  getEventPreferencesHandler,
  getGroupPreferenceAggregationHandler,
} from "../handlers/preferenceHandlers";
import {
  confirmEventAttendanceHandler,
  revokeEventAttendanceHandler,
  getEventConfirmationsHandler,
} from "../handlers/confirmationHandlers";

export const groupRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // GET /groups/:id
  app.get(
    "/:id",
    {
      schema: {
        description: "This route fetches information from a group",
        tags: ["groups"],
        response: {
          200: StatusOK(
            groupDTO,
            "if the group information was successfully fetched and converted to the expected format before sending the response",
          ),
          404: StatusError(
            ErrorTypes.UnknownIdError,
            "if no group with the provided id was found",
          ),
          500: StatusError(
            ErrorTypes.ConversionError,
            "if there was an error converting the group data to the expected format before sending the response",
          ),
        },
        params: SimpleIdParam("The UUID of the group being fetched"),
      },
    },
    getGroupByIdHandler,
  );

  // POST /groups
  app.post(
    "/",
    {
      schema: {
        description: "This route creates a new group",
        tags: ["groups"],
        response: {
          200: StatusOK(
            groupDTO,
            "if the group was successfully created and converted to the expected format before sending the response",
          ),
          500: StatusError(
            ErrorTypes.ConversionError,
            "if the group was created but there was an error converting it to the expected format before sending the response",
          ),
        },
        body: CreateGroupBody,
      },
    },
    createGroupHandler,
  );

  // DELETE /groups/:id
  app.delete(
    "/:id",
    {
      schema: {
        description: "This route deletes a group",
        tags: ["groups"],
        params: SimpleIdParam("The UUID of the group being deleted"),
        response: {
          200: StatusOK(
            groupDTO,
            "if the group was successfully deleted",
          ),
          404: StatusError(
            ErrorTypes.UnknownIdError,
            "if no group with the provided id was found",
          ),
          500: StatusError(
            ErrorTypes.DeleteError,
            "if there was an error deleting the group",
          ),
        },
      },
    },
    deleteGroupHandler,
  );

  // PATCH /groups/:id/photo
  app.patch(
    "/:id/photo",
    {
      schema: {
        description: "This route allows editing a group's photo",
        tags: ["groups"],
        params: SimpleIdParam(
          "The UUID of the group whose photo is being edited",
        ),
        response: {
          201: StatusOK(
            groupDTO,
            "if the group photo was successfully updated and the updated group data was successfully converted to the expected format before sending the response",
          ),
          404: StatusError(
            ErrorTypes.UnknownIdError,
            "if no group with the provided id was found",
          ),
          500: StatusError(
            ErrorTypes.ResourceCreationError,
            "if there was an error saving the group photo or updating the group with the new photo",
          ),
        },
      },
    },
    editGroupPhotoHandler,
  );

  // GET /groups/:id/photo
  app.get(
    "/:id/photo",
    {
      schema: {
        description: "This route fetches a group's photo",
        tags: ["groups"],
        params: SimpleIdParam(
          "The UUID of the group whose photo is being fetched",
        ),
        response: {
          200: Type.String({
            description: "The group photo as a stream",
          }),
          404: StatusError(
            ErrorTypes.UnknownIdError,
            "if no group with the provided id was found or if the group does not have a photo",
          ),
          500: StatusError(
            ErrorTypes.ResourceCreationError,
            "if there was an error fetching the group photo",
          ),
        },
      },
    },
    getGroupPhotoHandler,
  );

  // PATCH /groups/:id
  app.patch(
    "/:id",
    {
      schema: {
        description:
          "This route allows editing a group's information (except photo)",
        tags: ["groups"],
        params: SimpleIdParam(
          "The UUID of the group whose information is being edited",
        ),
        body: EditGroupBody,
        response: {
          200: StatusOK(
            groupDTO,
            "if the group information was successfully updated and converted to the expected format before sending the response",
          ),
          404: StatusError(
            ErrorTypes.UnknownIdError,
            "if no group with the provided id was found",
          ),
          500: StatusError(
            ErrorTypes.ConversionError,
            "if there was an error converting the updated group data to the expected format before sending the response",
          ),
        },
      },
    },
    editGroupHandler,
  );

  // ###### GROUP MEMBERS #######

  // POST /groups/:id/group-members
  app.post(
    "/:id/group-members",
    {
      schema: {
        description: "This route allows inviting users to a group",
        tags: ["groups"],
        params: SimpleIdParam(
          "The UUID of the group to which users are being invited",
        ),
        body: SimpleUsernameParam(
          "The username of the user being invited to the group",
        ),
        response: {
          201: StatusOK(
            groupMemberDTO,
            "Indicates that the users were successfully invited to the group",
          ),
          404: StatusError(
            ErrorTypes.UnknownIdError,
            "if no group or user with the provided id was found",
          ),
          500: StatusError(
            ErrorTypes.ResourceCreationError,
            "if there was an error creating the group invitation",
          ),
        },
      },
    },
    inviteUsersToGroupHandler,
  );

  // DELETE /groups/:id/group-members/:username
  app.delete(
    "/:id/group-members/:username",
    {
      schema: {
        description: "This route allows removing users from a group",
        tags: ["groups"],
        params: Type.Object({
          id: Type.String({ format: "uuid" }),
          username: Type.String(),
        }),
        response: {
          200: StatusOK(
            groupMemberDTO,
            "Indicates that the user was successfully removed from the group and the updated group member data was successfully converted to the expected format before sending the response",
          ),
          404: StatusError(
            ErrorTypes.UnknownIdError,
            "if no group or user with the provided id was found",
          ),
          500: StatusError(
            ErrorTypes.ConversionError,
            "if there was an error removing the user from the group",
          ),
        },
      },
    },
    removeUserFromGroupHandler,
  );

  // GET /groups/:id/group-members
  app.get(
    "/:id/group-members",
    {
      schema: {
        description:
          "This route fetches all members of a group (including members who have been banned or have not accepted their invite yet)",
        tags: ["groups"],
        params: SimpleIdParam(
          "The UUID of the group whose members are being fetched",
        ),
        response: {
          200: StatusOK(
            Type.Array(groupMemberDTO),
            "if the group members were successfully fetched and converted to the expected format before sending the response",
          ),
          404: StatusError(
            ErrorTypes.UnknownIdError,
            "if no group with the provided id was found",
          ),
          500: StatusError(
            ErrorTypes.ConversionError,
            "if there was an error converting the group members data to the expected format before sending the response",
          ),
        },
      },
    },
    getGroupMembersHandler,
  );

  // ###### ADMIN PROMOTION/DISMISSAL ENDPOINTS ######

  // PATCH /groups/:id/group-members/:username
  app.patch(
    "/:id/group-members/:username",
    {
      schema: {
        description: "Update a group member's role status (admin status)",
        tags: ["groups"],
        params: Type.Object({
          id: Type.String({ format: "uuid" }),
          username: Type.String(),
        }),
        body: UpdateMemberRoleBody,
        response: {
          200: StatusOK(groupMemberDTO, "If the member's role was successfully updated"),
          404: StatusError(ErrorTypes.UnknownIdError, "If the group or user was not found"),
          500: StatusError(ErrorTypes.UpdateError, "If the database update failed"),
        },
      },
    },
    updateUserGroupRoleHandler,
  );

  // ###### GROUP EVENTS ENDPOINTS ######

  // POST /groups/:id/events
  app.post(
    "/:id/events",
    {
      schema: {
        description: "Create a new group event with a dynamic voting deadline",
        tags: ["events"],
        params: SimpleIdParam("Group UUID"),
        body: CreateEventBody,
        response: {
          201: StatusOK(groupEventDTO, "Event created successfully"),
          400: StatusError(ErrorTypes.MalformedRequestError, "Voting end time constraint validation failed"),
          500: StatusError(ErrorTypes.ResourceCreationError, "Database execution failed"),
        },
      },
    },
    createGroupEventHandler,
  );

  // GET /groups/:id/events
  app.get(
    "/:id/events",
    {
      schema: {
        description: "Fetch all group events, optionally filtered by overlapping date ranges",
        tags: ["events"],
        params: SimpleIdParam("Group UUID"),
        querystring: Type.Object({
          startDate: Type.Optional(Type.String({ format: "date" })),
          endDate: Type.Optional(Type.String({ format: "date" })),
        }),
        response: {
          200: StatusOK(Type.Array(groupEventDTO), "List of group events retrieved successfully"),
          500: StatusError(ErrorTypes.ConversionError, "Conversion error"),
        },
      },
    },
    getGroupEventsHandler,
  );

  // GET /groups/:id/calendar
  app.get(
    "/:id/calendar",
    {
      schema: {
        description: "Fetch the combined group calendar containing group events and group members' personal events.",
        tags: ["groups"],
        params: SimpleIdParam("Group UUID"),
        querystring: Type.Object({
          startDate: Type.Optional(Type.String({ format: "date" })),
          endDate: Type.Optional(Type.String({ format: "date" })),
        }),
        response: {
          200: StatusOK(groupCalendarDTO, "Combined group calendar retrieved successfully"),
          403: StatusError(ErrorTypes.UnauthorizedError, "If the caller is not a member of the group"),
          404: StatusError(ErrorTypes.UnknownIdError, "Group not found"),
          500: StatusError(ErrorTypes.ConversionError, "Conversion error"),
        },
      },
    },
    getGroupCalendarHandler,
  );

  // GET /groups/:id/events/:idevent
  app.get(
    "/:id/events/:idevent",
    {
      schema: {
        description: "Get specific group event details by ID",
        tags: ["events"],
        params: Type.Object({
          id: Type.String({ format: "uuid", description: "Group UUID" }),
          idevent: Type.String({ format: "uuid", description: "Event UUID" }),
        }),
        response: {
          200: StatusOK(groupEventDTO, "Event details retrieved successfully"),
          404: StatusError(ErrorTypes.UnknownIdError, "Event not found"),
          500: StatusError(ErrorTypes.ConversionError, "Conversion error"),
        },
      },
    },
    getGroupEventByIdHandler,
  );

  // PATCH /groups/:id/events/:idevent
  app.patch(
    "/:id/events/:idevent",
    {
      schema: {
        description: "Modify an existing group event's title, description or voting deadline",
        tags: ["events"],
        params: Type.Object({
          id: Type.String({ format: "uuid", description: "Group UUID" }),
          idevent: Type.String({ format: "uuid", description: "Event UUID" }),
        }),
        body: EditEventBody,
        response: {
          200: StatusOK(groupEventDTO, "Event updated successfully"),
          400: StatusError(ErrorTypes.MalformedRequestError, "Voting end time constraint validation failed"),
          404: StatusError(ErrorTypes.UnknownIdError, "Event not found"),
          500: StatusError(ErrorTypes.UpdateError, "Database execution failed"),
        },
      },
    },
    editGroupEventHandler,
  );

  // POST /groups/:id/events/:idevent/resolve-tie
  app.post(
    "/:id/events/:idevent/resolve-tie",
    {
      schema: {
        description: "Submit the event creator's tie-breaking decision to choose the winning plan",
        tags: ["events"],
        params: Type.Object({
          id: Type.String({ format: "uuid", description: "Group UUID" }),
          idevent: Type.String({ format: "uuid", description: "Event UUID" }),
        }),
        body: ResolveTieBody,
        response: {
          200: StatusOK(Type.Object({ message: Type.String() }), "Tie successfully resolved"),
          403: StatusError(ErrorTypes.UpdateError, "Action forbidden: Caller is not the creator, or target plan is not tied"),
          404: StatusError(ErrorTypes.UnknownIdError, "Event or plan not found, or not in tie-breaker state"),
        },
      },
    },
    resolveTieHandler,
  );

  // ###### EVENT PLANNING PREFERENCES ENDPOINTS ######

  // POST /groups/:id/events/:idevent/preferences
  app.post(
    "/:id/events/:idevent/preferences",
    {
      schema: {
        description: "Create or update user planning preferences for a group event",
        tags: ["preferences"],
        params: Type.Object({
          id: Type.String({ format: "uuid" }),
          idevent: Type.String({ format: "uuid" }),
        }),
        body: CreatePreferenceBody,
        response: {
          200: StatusOK(preferenceDTO, "Preferences saved successfully"),
          404: StatusError(ErrorTypes.UnknownIdError, "Event not found, or caller not a group member"),
          500: StatusError(ErrorTypes.ResourceCreationError, "Database execution failed"),
        },
      },
    },
    createOrEditEventPreferenceHandler,
  );

  // GET /groups/:id/events/:idevent/preferences/group
  app.get(
    "/:id/events/:idevent/preferences/group",
    {
      schema: {
        description: "Retrieve anonymously aggregated group preference overlaps summary",
        tags: ["preferences"],
        params: Type.Object({
          id: Type.String({ format: "uuid" }),
          idevent: Type.String({ format: "uuid" }),
        }),
        response: {
          200: StatusOK(groupPreferenceReportDTO, "Group preference overlap report generated successfully"),
          404: StatusError(ErrorTypes.UnknownIdError, "Event not found"),
          500: StatusError(ErrorTypes.ConversionError, "Aggregation/Conversion error"),
        },
      },
    },
    getGroupPreferenceAggregationHandler,
  );

  // GET /groups/:id/events/:idevent/preferences
  app.get(
    "/:id/events/:idevent/preferences",
    {
      schema: {
        description: "Retrieve all members' preferences (hiding private preferences of other members)",
        tags: ["preferences"],
        params: Type.Object({
          id: Type.String({ format: "uuid" }),
          idevent: Type.String({ format: "uuid" }),
        }),
        response: {
          200: StatusOK(Type.Array(preferenceDTO), "All visible preferences retrieved successfully"),
          404: StatusError(ErrorTypes.UnknownIdError, "Event not found"),
          500: StatusError(ErrorTypes.ConversionError, "Conversion error"),
        },
      },
    },
    getEventPreferencesHandler,
  );

  // GET /groups/:id/events/:idevent/preferences/:username
  app.get(
    "/:id/events/:idevent/preferences/:username",
    {
      schema: {
        description: "Retrieve specific group member availability preference (hides private options of other users)",
        tags: ["preferences"],
        params: Type.Object({
          id: Type.String({ format: "uuid" }),
          idevent: Type.String({ format: "uuid" }),
          username: Type.String(),
        }),
        response: {
          200: StatusOK(preferenceDTO, "Preference data retrieved successfully"),
          404: StatusError(ErrorTypes.UnknownIdError, "Preference not found or hidden by privacy controls"),
          500: StatusError(ErrorTypes.ConversionError, "Conversion error"),
        },
      },
    },
    getEventPreferenceByUsernameHandler,
  );

  // ###### EVENT PLANS & VOTING ENDPOINTS ######

  // GET /groups/:id/events/:idevent/plans
  app.get(
    "/:id/events/:idevent/plans",
    {
      schema: {
        description: "Get all proposed plans for a group event along with vote counts",
        tags: ["plans"],
        params: Type.Object({
          id: Type.String({ format: "uuid" }),
          idevent: Type.String({ format: "uuid" }),
        }),
        response: {
          200: StatusOK(Type.Array(planDTO), "List of plans retrieved successfully"),
          404: StatusError(ErrorTypes.UnknownIdError, "Event not found"),
          500: StatusError(ErrorTypes.ConversionError, "Conversion error"),
        },
      },
    },
    getEventPlansHandler,
  );

  // POST /groups/:id/events/:idevent/plans
  app.post(
    "/:id/events/:idevent/plans",
    {
      schema: {
        description: "Propose a new plan coordinate/option for a group event",
        tags: ["plans"],
        params: Type.Object({
          id: Type.String({ format: "uuid" }),
          idevent: Type.String({ format: "uuid" }),
        }),
        body: CreatePlanBody,
        response: {
          201: StatusOK(planDTO, "Plan proposed successfully"),
          404: StatusError(ErrorTypes.UnknownIdError, "Event not found, or user is not a group member"),
          500: StatusError(ErrorTypes.ResourceCreationError, "Database execution failed"),
        },
      },
    },
    createEventPlanHandler,
  );

  // GET /groups/:id/events/:idevent/plans/:idplan
  app.get(
    "/:id/events/:idevent/plans/:idplan",
    {
      schema: {
        description: "Retrieve specific plan details",
        tags: ["plans"],
        params: Type.Object({
          id: Type.String({ format: "uuid" }),
          idevent: Type.String({ format: "uuid" }),
          idplan: Type.String({ format: "uuid" }),
        }),
        response: {
          200: StatusOK(planDTO, "Plan details retrieved successfully"),
          404: StatusError(ErrorTypes.UnknownIdError, "Plan proposal not found"),
          500: StatusError(ErrorTypes.ConversionError, "Conversion error"),
        },
      },
    },
    getEventPlanByIdHandler,
  );

  // PATCH /groups/:id/events/:idevent/plans/:idplan
  app.patch(
    "/:id/events/:idevent/plans/:idplan",
    {
      schema: {
        description: "Edit proposed plan coordinates (restricted to the original plan proposer)",
        tags: ["plans"],
        params: Type.Object({
          id: Type.String({ format: "uuid" }),
          idevent: Type.String({ format: "uuid" }),
          idplan: Type.String({ format: "uuid" }),
        }),
        body: EditPlanBody,
        response: {
          200: StatusOK(planDTO, "Plan updated successfully"),
          403: StatusError(ErrorTypes.UpdateError, "Action forbidden: Proposer mismatch"),
          404: StatusError(ErrorTypes.UnknownIdError, "Plan not found"),
          500: StatusError(ErrorTypes.ConversionError, "Conversion error"),
        },
      },
    },
    editEventPlanHandler,
  );

  // POST /groups/:id/events/:idevent/plans/:idplan/votes
  app.post(
    "/:id/events/:idevent/plans/:idplan/votes",
    {
      schema: {
        description: "Cast an approval vote for a proposed event plan",
        tags: ["plans"],
        params: Type.Object({
          id: Type.String({ format: "uuid" }),
          idevent: Type.String({ format: "uuid" }),
          idplan: Type.String({ format: "uuid" }),
        }),
        response: {
          200: StatusOK(Type.Object({ message: Type.String() }), "Vote successfully casted"),
          404: StatusError(ErrorTypes.UnknownIdError, "Event or plan not found"),
        },
      },
    },
    voteEventPlanHandler,
  );

  // DELETE /groups/:id/events/:idevent/plans/:idplan/votes
  app.delete(
    "/:id/events/:idevent/plans/:idplan/votes",
    {
      schema: {
        description: "Remove a previously casted approval vote",
        tags: ["plans"],
        params: Type.Object({
          id: Type.String({ format: "uuid" }),
          idevent: Type.String({ format: "uuid" }),
          idplan: Type.String({ format: "uuid" }),
        }),
        response: {
          200: StatusOK(Type.Object({ message: Type.String() }), "Vote successfully removed"),
          404: StatusError(ErrorTypes.UnknownIdError, "Event or plan not found"),
        },
      },
    },
    removeVoteEventPlanHandler,
  );

  // ###### EVENT ATTENDANCE CONFIRMATION ENDPOINTS ######

  // POST /groups/:id/events/:idevent/confirmations
  app.post(
    "/:id/events/:idevent/confirmations",
    {
      schema: {
        description: "Confirm group member attendance for a group event",
        tags: ["confirmations"],
        params: Type.Object({
          id: Type.String({ format: "uuid", description: "Group UUID" }),
          idevent: Type.String({ format: "uuid", description: "Event UUID" }),
        }),
        response: {
          200: StatusOK(eventConfirmationDTO, "Attendance confirmed successfully"),
          500: StatusError(ErrorTypes.ConversionError, "Conversion error"),
        },
      },
    },
    confirmEventAttendanceHandler,
  );

  // DELETE /groups/:id/events/:idevent/confirmations
  app.delete(
    "/:id/events/:idevent/confirmations",
    {
      schema: {
        description: "Revoke attendance confirmation for a group event",
        tags: ["confirmations"],
        params: Type.Object({
          id: Type.String({ format: "uuid", description: "Group UUID" }),
          idevent: Type.String({ format: "uuid", description: "Event UUID" }),
        }),
        response: {
          200: StatusOK(Type.Null(), "Attendance confirmation revoked successfully"),
          404: StatusError(ErrorTypes.UnknownIdError, "Attendance confirmation not found"),
          500: StatusError(ErrorTypes.DeleteError, "Database execution failed"),
        },
      },
    },
    revokeEventAttendanceHandler,
  );

  // GET /groups/:id/events/:idevent/confirmations
  app.get(
    "/:id/events/:idevent/confirmations",
    {
      schema: {
        description: "Get all attendance confirmations for a group event",
        tags: ["confirmations"],
        params: Type.Object({
          id: Type.String({ format: "uuid", description: "Group UUID" }),
          idevent: Type.String({ format: "uuid", description: "Event UUID" }),
        }),
        response: {
          200: StatusOK(Type.Array(eventConfirmationDTO), "List of confirmations retrieved successfully"),
          500: StatusError(ErrorTypes.ConversionError, "Conversion error"),
        },
      },
    },
    getEventConfirmationsHandler,
  );
};
