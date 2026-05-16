import { profileDTO,  CreateProfileBody, genericError, ErrorTypes, SimpleIdParam, UsernameParam } from "@baza/shared-types";
import { type TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyPluginAsync } from "fastify";
import { getUserByUsernameHandler, createUserProfileHandler } from "../handlers/profileHandlers";


export const userRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  app.get(
    "/:username",
    {
      schema: {
        description: "This route fetches profile information from a user of the app",
        tags: ["users"],
        response: {
          200: profileDTO,
          404: genericError(ErrorTypes.UnknownIdError, "No profile of the user with said username was found"),
          500: genericError(
            ErrorTypes.ConversionError,
            "There was an error converting the profile data to the expected format before sending the response",
          ),
        },
        params: UsernameParam,
      },
    },
    getUserByUsernameHandler
  );

  app.post(
    "/create",
    {
      schema: {
        description: "This route creates a profile for a user of the app",
        tags: ["users"],
        body: CreateProfileBody,
        response: {
          201: profileDTO,
          400: genericError(ErrorTypes.MalformedRequestError, "The given profile data is not valid"),
          500: genericError(
            ErrorTypes.ConversionError,
            "The profile was created but there was an error converting it to the expected format before sending the response",
          ),
        },
      },
    },
    createUserProfileHandler
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