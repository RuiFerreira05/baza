import Type from "typebox";

export function SafeDate(
  options?: Parameters<typeof Type.Unsafe<Date>>[0] & {
    /** The date serialization format. Defaults to `datetime` (ISO-8601). */
    format: "date" | "datetime";
  },
) {
  return Type.Unsafe<Date>({ type: "string", format: "datetime", ...options });
}

// ####### DTO #######
export const userPublicSchema = Type.Object({
  id: Type.String({
    description: "user ID, randomly given",
    example: "1y9889192bfb987",
  }),
  name: Type.String({ description: "user name", example: "John Doe" }),
  email: Type.String({
    format: "email",
    description: "user email",
    example: "test@test.com",
  }),
}, {
  description: "Public user data, without sensitive information like password",
  title: "UserDTO",
});
export type UserDTO = Type.Static<typeof userPublicSchema>; 

export const userProfilePublicSchema = Type.Object({
  username: Type.String({description: "username of user", example: "random_user123"}),
  photo: Type.Union([ Type.String({description: "profile photo of the user"}), Type.Null() ]),
  description: Type.Union([ Type.String({description: "Profile description of user", example: "Hi, i'm random_user123!"}), Type.Null() ]),
  userId: Type.String({description: "user ID (randomly given)", example: "1y9889192bfb987"}),
  createdAt: SafeDate(),
  updatedAt: SafeDate(),
}, {
  description: "Public user profile data, without sensitive information",
  title: "UserProfileDTO",
});
export type UserProfileDTO = Type.Static<typeof userProfilePublicSchema>;

// ####### Route Specific Schemas #######

// GET /users
export const getUsersResponseSchema = Type.Array(userPublicSchema, {
  description: "Response schema for GET /users, an array of user objects",
  title: "GetUsersResponse",
});
export type GetUsersResponse = Type.Static<typeof getUsersResponseSchema>;

// POST /users
export const createUserRequestSchema = Type.Object({
  id: Type.Optional(Type.Number()),
  name: Type.String({ minLength: 1, maxLength: 20 }),
  email: Type.String({ format: "email" }),
  passwordHash: Type.String(),
});
export type CreateUserRequest = Type.Static<typeof createUserRequestSchema>;

// GET /users/:id
export const getUserProfileResponseSchema = userProfilePublicSchema
export type GetUserProfileResponse = Type.Static<typeof getUserProfileResponseSchema>;

// POST /users/createProfile
export const createUserProfileRequestSchema = userProfilePublicSchema
export type createUserProfileRequest = Type.Static<typeof createUserProfileRequestSchema>;

export const createUserProfileResponseSchema = userProfilePublicSchema
export type createUserProfileResponse = Type.Static<typeof createUserProfileResponseSchema>;
