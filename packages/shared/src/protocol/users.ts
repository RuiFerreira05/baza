import Type from "typebox";

// ####### DTO #######
export const userDTO = Type.Object({
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
export type UserDTO = Type.Static<typeof userDTO>; 

export const profileDTO = Type.Object({
  username: Type.String({description: "username of user", example: "random_user123"}),
  photo: Type.Union([ Type.String({description: "profile photo of the user"}), Type.Null() ]),
  description: Type.Union([ Type.String({description: "Profile description of user", example: "Hi, i'm random_user123!"}), Type.Null() ]),
  userId: Type.String({description: "user ID (randomly given)", format: "uuid", example: "1y9889192bfb987"}),
  createdAt: Type.String({
    description: "The date and time when the profile was created",
    format: "date-time"
  }),
  updatedAt: Type.String({
    description: "The date and time when the profile was last updated",
    format: "date-time"
  }),
}, {
  description: "Public user profile data, without sensitive information",
  title: "UserProfileDTO",
});
export type ProfileDTO = Type.Static<typeof profileDTO>;

// ####### Route Specific Schemas #######

// GET /users
export const getUsersResponseSchema = Type.Array(userDTO, {
  description: "Response schema for GET /users, an array of user objects",
  title: "GetUsersResponse",
});
export type GetUsersResponse = Type.Static<typeof getUsersResponseSchema>;

// POST /users
export const CreateUserRequestSchema = Type.Object({
  id: Type.Optional(Type.Number()),
  name: Type.String({ minLength: 1, maxLength: 20 }),
  email: Type.String({ format: "email" }),
  passwordHash: Type.String(),
});
export type CreateUserRequest = Type.Static<typeof CreateUserRequestSchema>;

// POST /users/createProfile
export const CreateProfileBody = Type.Object({
  username: Type.String({ description: "The username of the user who is the owner of the profile being created." }),
  userId: Type.String({ description: "ID of the user creating this profile.", format: "uuid" }),
});
export type CreateProfileBody = Type.Static<typeof CreateProfileBody>;

// Parameters
export const UsernameParam = Type.Object({
  username: Type.String({
    description: "Username of a user of the aplication",
  })
});
export type UsernameParam = Type.Static<typeof UsernameParam>
