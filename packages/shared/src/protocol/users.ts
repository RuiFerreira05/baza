import Type from "typebox";

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
