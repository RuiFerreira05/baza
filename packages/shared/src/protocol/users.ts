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

// PATCH /users/:username/delete
export const EditProfileBody = Type.Object({
  newUsername: Type.Optional(
    Type.String({
      description: "The new username of the user who's the owner of this profile. If not provided, the username will not be changed",
    }),
  ),
  newDescription: Type.Optional(
    Type.String({
      description: "The new description of the user's profile. If not provided, the profile description will not be changed",
    }),
  ),
});
export type EditProfileBody = Type.Static<typeof EditProfileBody>;

// POST /users/:username/friends/sendRequest
export const SendFriendRequestBody = Type.Object({
  recipientUsername: Type.String({
    description: "The username of the user to send the friend request to.",
  }),
});
export type SendFriendRequestBody = Type.Static<typeof SendFriendRequestBody>;

// DTO for Friend Requests
export const FriendRequestDTO = Type.Object({
  sender: profileDTO,
  requestSentAt: Type.String({ format: "date-time" }),
});
export type FriendRequestDTO = Type.Static<typeof FriendRequestDTO>;
