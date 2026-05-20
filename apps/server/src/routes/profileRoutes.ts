import { profileDTO,  CreateProfileBody, ErrorTypes, StatusOK, StatusError, SimpleUsernameParam } from "@baza/shared-types";
import { type TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyPluginAsync } from "fastify";
import { getUserByUsernameHandler, createUserProfileHandler, deleteUserProfileHandler } from "../handlers/profileHandlers";


export const userRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // GET /users/:username
  app.get(
    "/:username",
    {
      schema: {
        description: "This route fetches profile information from a user of the app",
        tags: ["users"],
        response: {
          200: StatusOK(
            profileDTO,
            "if the profile information was successfully fetched and converted to the expected format before sending the response",
          ),
          404: StatusError(
            ErrorTypes.UnknownUsernameError,
            "if no profile from user with the provided username was found",
          ),
          500: StatusError(
            ErrorTypes.ConversionError,
            "if there was an error converting the profile data to the expected format before sending the response",
          ),
        },
        params: SimpleUsernameParam("Username of a user of the aplication whose profile is being created"),
      },
    },
    getUserByUsernameHandler
  );

  // DELETE /users/create
  app.post(
    "/create",
    {
      schema: {
        description: "This route creates a profile for a user of the app",
        tags: ["users"],
        body: CreateProfileBody,
        response: {
          200: StatusOK(
            profileDTO,
            "if the profile was successfully created and converted to the expected format before sending the response",
          ),
          500: StatusError(
            ErrorTypes.ConversionError,
            "if the profile was created but there was an error converting it to the expected format before sending the response",
          ),
        },
      },
    },
    createUserProfileHandler
  );

  // DELETE /users/:username/delete
  app.delete(
    "/:username/delete",
    {
      schema: {
        description: "This route deletes a user's profile",
        tags: ["users"],
        params: SimpleUsernameParam("The username of the user whose profile is being deleted"),
        response: {
          200: StatusOK(
            profileDTO,
            "if the profile was successfully deleted",
          ),
          404: StatusError(
            ErrorTypes.UnknownIdError,
            "if no user with the provided username was found",
          ),
          500: StatusError(
            ErrorTypes.DeleteError,
            "if there was an error deleting the profile",
          ),
        },
      },
    },
    deleteUserProfileHandler
  );
    

//   app.get(
//     "/:id/events",
//     {
//       schema: {
//         description: "This route fetches all events, in the given time period, from a user calendar.",
//         tags: ["users"],
//         querystring: {
//           startDate: QueryStringParameter("Start date of the time period. Following ISO format: yyyy-mm-dd"),
//           endDate: QueryStringParameter("End date of the time period. Following ISO format: yyyy-mm-dd"),
//         },
//         response: {
//           200: getPersonalEventsResponseSchema,
//           404: genericError(ErrorTypes.UnknownIdError, "No events of the user with said id were found at that period of time"),
//           500: genericError(
//             ErrorTypes.ConversionError,
//             "There was an error converting the events data to the expected format before sending the response",
//           ),
//         },
//         params: SimpleIdParam("username of user who is the owner of these events"),
//       },
//     },

//   );
 }