import {
  profiles,
  users,
  friends,
  groups,
  groupMembers,
} from "@baza/db/schemas";
import { db } from "../lib/db";
import { eq, and, sql } from "drizzle-orm";
import {
  ErrorTypes,
  profileDTO,
  groupDTO,
  groupMemberDTO,
  FriendRequestDTO,
  SentFriendRequestDTO,
  type CreateProfileBody,
  type PersonalEventDTO,
  type ProfileDTO,
  type GroupDTO,
  type GroupMemberDTO,
} from "@baza/shared-types";
import { Value } from "typebox/value";
import { Type } from "typebox";
import { Err, Ok, type Result } from "../lib/types";
import { app } from "../setup";

/**
 * This method fetches the profile data of a specific user from the database by their username,
 * converts it to a profileDTO, and returns it. If no user with the provided username is found,
 * it returns an UnknownUsernameError. If there is an error converting the profile data to the
 * expected format, it returns a ConversionError.
 *
 * @param username user's name in the app
 * @returns a promised result with a profileDTO, or an error
 */
export const getUserByUsername = async (
  username: string,
): Promise<
  Result<
    ProfileDTO,
    ErrorTypes.ConversionError | ErrorTypes.UnknownUsernameError
  >
> => {
  const profile = await db.query.profiles.findFirst({
    columns: {
      settings: false,
    },
    where: {
      username: username,
    },
  });

  if (profile) {
    const sanitizedProfile = {
      ...profile,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };

    const converted = Value.Convert(profileDTO, sanitizedProfile);
    if (Value.Check(profileDTO, converted)) {
      return Ok(converted);
    } else {
      app.log.error(Value.Errors(profileDTO, converted));
      return Err(ErrorTypes.ConversionError);
    }
  } else {
    return Err(ErrorTypes.UnknownUsernameError);
  }
};

/**
 * This method creates a new profile for an existing user in the database with the provided username and id.
 * It then converts the created profile to a profileDTO and returns it. If there is an error creating the profile,
 * it returns a ResourceCreationError. If there is an error converting the profile data to the
 * expected format, it returns a ConversionError.
 *
 * @param userProfile schema with username and id of user
 * @returns a promised result with the created profileDTO, or an error
 */
export const createUserProfile = async (
  userProfile: CreateProfileBody,
): Promise<
  Result<
    ProfileDTO,
    | ErrorTypes.ConversionError
    | ErrorTypes.ResourceCreationError
    | ErrorTypes.UnknownIdError
  >
> => {
  //Verify if the user whose profile is being created, exists.
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userProfile.userId));

  if (user.length == 1) {
    const [newProfile] = await db
      .insert(profiles)
      .values({
        username: userProfile.username,
        userId: userProfile.userId,
        settings: {},
      })
      .returning();

    if (newProfile) {
      const sanitizedProfile = {
        ...newProfile,
        createdAt: newProfile?.createdAt.toISOString(),
        updatedAt: newProfile?.updatedAt.toISOString(),
      };

      const converted = Value.Convert(profileDTO, sanitizedProfile);
      if (Value.Check(profileDTO, converted)) {
        return Ok(converted);
      } else {
        app.log.error(Value.Errors(profileDTO, converted));
        return Err(ErrorTypes.ConversionError);
      }
    } else {
      return Err(ErrorTypes.ResourceCreationError);
    }
  } else {
    return Err(ErrorTypes.UnknownIdError);
  }
};

/**
 * This method deletes a user's profile from the database by the provided username.
 * If the profile is successfully deleted, it returns the deleted profile as a profileDTO.
 * If the profile is not found, it returns an UnknownUsernameError. If there is an error during
 * the deletion process or conversion, it returns a DeleteError.
 *
 * @param username the username of the user whose profile is being deleted
 * @returns a promised result with the deleted profileDTO, or an error
 */
export const deleteUserProfile = async (
  username: string,
): Promise<
  Result<ProfileDTO, ErrorTypes.DeleteError | ErrorTypes.UnknownUsernameError>
> => {
  try {
    const deletedProfile = await db.transaction(async (tx) => {
      const [profile] = await tx
        .delete(profiles)
        .where(eq(profiles.username, username))
        .returning();

      if (!profile) {
        app.log.warn(`Profile from user with username ${username} not found`);
        tx.rollback();
      }

      const sanitizedProfile = {
        ...profile,
        createdAt: profile?.createdAt.toISOString(),
        updatedAt: profile?.updatedAt.toISOString(),
      };

      const converted = Value.Convert(profileDTO, sanitizedProfile);
      if (Value.Check(profileDTO, converted)) {
        return converted;
      } else {
        app.log.error(Value.Errors(profileDTO, converted));
        tx.rollback();
      }
    });

    if (deletedProfile) {
      return Ok(deletedProfile);
    } else {
      return Err(ErrorTypes.UnknownUsernameError);
    }
  } catch (error) {
    app.log.error(
      `Failed to delete profile from user with username ${username}: ${(error as Error).message}`,
    );
    return Err(ErrorTypes.DeleteError);
  }
};

/**
 * This method updates the username and/or description of an existing user profile. If successful, it
 * returns the updated profile as a profileDTO. If no user with the provided username is found, it
 * returns an UnknownUsernameError. If there is an error converting the profile data to the
 * expected format, it returns a ConversionError.
 *
 * @param username username of the user whose profile is being edited
 * @param newUserName new username of the user whose profile is being edited
 * @param description new description of the profile that is being edited
 * @returns a promised result with the updated profileDTO, or an error
 */
export const editUserProfile = async (
  username: string,
  newUserName: string | undefined,
  description: string | undefined,
): Promise<
  Result<
    ProfileDTO,
    | ErrorTypes.UnknownUsernameError
    | ErrorTypes.ConversionError
    | ErrorTypes.ExistingResourceError
  >
> => {
  const usernameCheck = await db.query.profiles.findFirst({
    where: {
      username: newUserName,
    },
  });

  if (!usernameCheck || newUserName == undefined) {
    const [profile] = await db
      .update(profiles)
      .set({
        username: newUserName,
        description: description,
        updatedAt: new Date(),
      })
      .where(eq(profiles.username, username))
      .returning();

    if (profile) {
      const sanitizedProfile = {
        ...profile,
        createdAt: profile?.createdAt.toISOString(),
        updatedAt: profile?.updatedAt.toISOString(),
      };

      const converted = Value.Convert(profileDTO, sanitizedProfile);
      if (Value.Check(profileDTO, converted)) {
        return Ok(converted);
      } else {
        app.log.error(Value.Errors(profileDTO, converted));
        return Err(ErrorTypes.ConversionError);
      }
    } else {
      app.log.warn(`User with id ${username} not found`);
      return Err(ErrorTypes.UnknownUsernameError);
    }
  } else {
    app.log.warn(`User with name ${newUserName} already exists`);
    return Err(ErrorTypes.ExistingResourceError);
  }
};

/**
 * Gets user settings.
 */
export const getUserSettings = async (
  username: string,
): Promise<Result<any, ErrorTypes.UnknownUsernameError>> => {
  try {
    const profile = await db.query.profiles.findFirst({
      columns: {
        settings: true,
      },
      where: { username: username },
    });

    if (!profile) {
      return Err(ErrorTypes.UnknownUsernameError);
    }

    return Ok(profile.settings);
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to get user settings",
    );
    return Err(ErrorTypes.UnknownUsernameError);
  }
};

/**
 * Updates user settings.
 */
export const updateUserSettings = async (
  username: string,
  settings: any,
): Promise<
  Result<any, ErrorTypes.UnknownUsernameError | ErrorTypes.UpdateError>
> => {
  try {
    const [updated] = await db
      .update(profiles)
      .set({
        settings,
        updatedAt: new Date(),
      })
      .where(eq(profiles.username, username))
      .returning();

    if (!updated) {
      return Err(ErrorTypes.UnknownUsernameError);
    }

    return Ok(updated.settings);
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to update user settings",
    );
    return Err(ErrorTypes.UpdateError);
  }
};

/**
 * Retrieves the groups that the user is an active member of.
 */
export const getUserGroups = async (
  username: string,
): Promise<Result<GroupDTO[], ErrorTypes.ConversionError>> => {
  try {
    const rows = await db
      .select({
        id: groups.id,
        groupname: groups.groupname,
        description: groups.description,
        photo: groups.photo,
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(
        and(
          eq(groupMembers.username, username),
          eq(groupMembers.acceptedInvite, true),
          eq(groupMembers.banned, false),
        ),
      );

    const checkSchema = Value.Convert(Type.Array(groupDTO), rows);
    if (Value.Check(Type.Array(groupDTO), checkSchema)) {
      return Ok(checkSchema as GroupDTO[]);
    } else {
      app.log.error(Value.Errors(Type.Array(groupDTO), checkSchema));
      return Err(ErrorTypes.ConversionError);
    }
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to fetch user groups",
    );
    return Err(ErrorTypes.ConversionError);
  }
};

/**
 * Retrieves the pending group invitations for the user.
 */
export const getUserGroupInvites = async (
  username: string,
): Promise<Result<GroupDTO[], ErrorTypes.ConversionError>> => {
  try {
    const rows = await db
      .select({
        id: groups.id,
        groupname: groups.groupname,
        description: groups.description,
        photo: groups.photo,
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(
        and(
          eq(groupMembers.username, username),
          eq(groupMembers.acceptedInvite, false),
          eq(groupMembers.banned, false),
        ),
      );

    const checkSchema = Value.Convert(Type.Array(groupDTO), rows);
    if (Value.Check(Type.Array(groupDTO), checkSchema)) {
      return Ok(checkSchema as GroupDTO[]);
    } else {
      app.log.error(Value.Errors(Type.Array(groupDTO), checkSchema));
      return Err(ErrorTypes.ConversionError);
    }
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to fetch user group invites",
    );
    return Err(ErrorTypes.ConversionError);
  }
};

/**
 * Accepts a group invitation.
 */
export const acceptGroupInvite = async (
  username: string,
  groupId: string,
): Promise<
  Result<
    GroupMemberDTO,
    | ErrorTypes.UnknownIdError
    | ErrorTypes.UpdateError
    | ErrorTypes.ConversionError
  >
> => {
  try {
    const [updated] = await db
      .update(groupMembers)
      .set({
        acceptedInvite: true,
        acceptedAt: new Date(),
      })
      .where(
        and(
          eq(groupMembers.username, username),
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.acceptedInvite, false),
        ),
      )
      .returning();

    if (!updated) {
      return Err(ErrorTypes.UnknownIdError);
    }

    const conv = Value.Convert(groupMemberDTO, updated);
    if (Value.Check(groupMemberDTO, conv)) {
      return Ok(conv);
    } else {
      app.log.error(Value.Errors(groupMemberDTO, conv));
      return Err(ErrorTypes.ConversionError);
    }
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to accept group invite",
    );
    return Err(ErrorTypes.UpdateError);
  }
};

/**
 * Declines a group invitation.
 */
export const declineGroupInvite = async (
  username: string,
  groupId: string,
): Promise<
  Result<null, ErrorTypes.UnknownIdError | ErrorTypes.DeleteError>
> => {
  try {
    const result = await db
      .delete(groupMembers)
      .where(
        and(
          eq(groupMembers.username, username),
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.acceptedInvite, false),
        ),
      )
      .returning();

    if (result.length === 0) {
      return Err(ErrorTypes.UnknownIdError);
    }

    return Ok(null);
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to decline group invite",
    );
    return Err(ErrorTypes.DeleteError);
  }
};

/**
 * Gets the profile of all accepted friends.
 */
export const getFriends = async (
  username: string,
): Promise<Result<ProfileDTO[], ErrorTypes.ConversionError>> => {
  try {
    const sentFriends = await db
      .select({
        username: profiles.username,
        photo: profiles.photo,
        description: profiles.description,
        userId: profiles.userId,
        createdAt: profiles.createdAt,
        updatedAt: profiles.updatedAt,
      })
      .from(friends)
      .innerJoin(profiles, eq(friends.receivedBy, profiles.username))
      .where(
        and(eq(friends.sentBy, username), eq(friends.friendStatus, "accepted")),
      );

    const receivedFriends = await db
      .select({
        username: profiles.username,
        photo: profiles.photo,
        description: profiles.description,
        userId: profiles.userId,
        createdAt: profiles.createdAt,
        updatedAt: profiles.updatedAt,
      })
      .from(friends)
      .innerJoin(profiles, eq(friends.sentBy, profiles.username))
      .where(
        and(
          eq(friends.receivedBy, username),
          eq(friends.friendStatus, "accepted"),
        ),
      );

    const records = [...sentFriends, ...receivedFriends];

    const formatted = records.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    const checkSchema = Value.Convert(Type.Array(profileDTO), formatted);
    if (Value.Check(Type.Array(profileDTO), checkSchema)) {
      return Ok(checkSchema as ProfileDTO[]);
    } else {
      app.log.error(Value.Errors(Type.Array(profileDTO), checkSchema));
      return Err(ErrorTypes.ConversionError);
    }
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to fetch friends list",
    );
    return Err(ErrorTypes.ConversionError);
  }
};

/**
 * Gets a specific friend's profile.
 */
export const getFriendProfile = async (
  username: string,
  friendUsername: string,
): Promise<
  Result<
    ProfileDTO,
    ErrorTypes.UnknownUsernameError | ErrorTypes.ConversionError
  >
> => {
  try {
    const [friendship] = await db
      .select()
      .from(friends)
      .where(
        and(
          sql`((${friends.sentBy} = ${username} AND ${friends.receivedBy} = ${friendUsername}) OR (${friends.sentBy} = ${friendUsername} AND ${friends.receivedBy} = ${username}))`,
          eq(friends.friendStatus, "accepted"),
        ),
      )
      .limit(1);

    if (!friendship) {
      return Err(ErrorTypes.UnknownUsernameError);
    }

    return getUserByUsername(friendUsername);
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to fetch friend profile",
    );
    return Err(ErrorTypes.UnknownUsernameError);
  }
};

/**
 * Removes a friend.
 */
export const removeFriend = async (
  username: string,
  friendUsername: string,
): Promise<
  Result<null, ErrorTypes.UnknownUsernameError | ErrorTypes.DeleteError>
> => {
  try {
    const deleted = await db
      .delete(friends)
      .where(
        sql`((${friends.sentBy} = ${username} AND ${friends.receivedBy} = ${friendUsername}) OR (${friends.sentBy} = ${friendUsername} AND ${friends.receivedBy} = ${username}))`,
      )
      .returning();

    if (deleted.length === 0) {
      return Err(ErrorTypes.UnknownUsernameError);
    }

    return Ok(null);
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to remove friend",
    );
    return Err(ErrorTypes.DeleteError);
  }
};

/**
 * Sends a friend request.
 */
export const sendFriendRequest = async (
  username: string,
  recipientUsername: string,
): Promise<
  Result<
    null,
    | ErrorTypes.UnknownUsernameError
    | ErrorTypes.MalformedRequestError
    | ErrorTypes.ExistingResourceError
  >
> => {
  try {
    if (username === recipientUsername) {
      return Err(ErrorTypes.MalformedRequestError);
    }

    const recipient = await db.query.profiles.findFirst({
      where: { username: recipientUsername },
    });

    if (!recipient) {
      return Err(ErrorTypes.UnknownUsernameError);
    }

    const [existing] = await db
      .select()
      .from(friends)
      .where(
        sql`((${friends.sentBy} = ${username} AND ${friends.receivedBy} = ${recipientUsername}) OR (${friends.sentBy} = ${recipientUsername} AND ${friends.receivedBy} = ${username}))`,
      )
      .limit(1);

    if (existing) {
      if (
        existing.friendStatus === "accepted" ||
        existing.friendStatus === "pending"
      ) {
        return Err(ErrorTypes.ExistingResourceError);
      }
      if (existing.friendStatus === "blocked") {
        return Err(ErrorTypes.MalformedRequestError);
      }
      // If rejected, reset it to pending
      await db
        .update(friends)
        .set({
          sentBy: username,
          receivedBy: recipientUsername,
          friendStatus: "pending",
          requestSentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          sql`((${friends.sentBy} = ${username} AND ${friends.receivedBy} = ${recipientUsername}) OR (${friends.sentBy} = ${recipientUsername} AND ${friends.receivedBy} = ${username}))`,
        );
      return Ok(null);
    }

    await db.insert(friends).values({
      sentBy: username,
      receivedBy: recipientUsername,
      friendStatus: "pending",
    });

    return Ok(null);
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to send friend request",
    );
    return Err(ErrorTypes.MalformedRequestError);
  }
};

/**
 * Gets pending received friend requests.
 */
export const getPendingFriendRequests = async (
  username: string,
): Promise<Result<any[], ErrorTypes.ConversionError>> => {
  try {
    const records = await db
      .select({
        username: profiles.username,
        photo: profiles.photo,
        description: profiles.description,
        userId: profiles.userId,
        createdAt: profiles.createdAt,
        updatedAt: profiles.updatedAt,
        requestSentAt: friends.requestSentAt,
      })
      .from(friends)
      .innerJoin(profiles, eq(friends.sentBy, profiles.username))
      .where(
        and(
          eq(friends.receivedBy, username),
          eq(friends.friendStatus, "pending"),
        ),
      );

    const formatted = records.map((r) => ({
      sender: {
        username: r.username,
        photo: r.photo,
        description: r.description,
        userId: r.userId,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      },
      requestSentAt: r.requestSentAt.toISOString(),
    }));

    const checkSchema = Value.Convert(Type.Array(FriendRequestDTO), formatted);
    if (Value.Check(Type.Array(FriendRequestDTO), checkSchema)) {
      return Ok(checkSchema as any[]);
    } else {
      app.log.error(Value.Errors(Type.Array(FriendRequestDTO), checkSchema));
      return Err(ErrorTypes.ConversionError);
    }
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to fetch pending requests",
    );
    return Err(ErrorTypes.ConversionError);
  }
};

/**
 * Accepts a friend request.
 */
export const acceptFriendRequest = async (
  username: string,
  senderUsername: string,
): Promise<
  Result<null, ErrorTypes.UnknownUsernameError | ErrorTypes.UpdateError>
> => {
  try {
    const [updated] = await db
      .update(friends)
      .set({
        friendStatus: "accepted",
        requestAcceptedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(friends.sentBy, senderUsername),
          eq(friends.receivedBy, username),
          eq(friends.friendStatus, "pending"),
        ),
      )
      .returning();

    if (!updated) {
      return Err(ErrorTypes.UnknownUsernameError);
    }

    return Ok(null);
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to accept friend request",
    );
    return Err(ErrorTypes.UpdateError);
  }
};

/**
 * Declines a friend request.
 */
export const declineFriendRequest = async (
  username: string,
  senderUsername: string,
): Promise<
  Result<null, ErrorTypes.UnknownUsernameError | ErrorTypes.UpdateError>
> => {
  try {
    const [updated] = await db
      .update(friends)
      .set({
        friendStatus: "rejected",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(friends.sentBy, senderUsername),
          eq(friends.receivedBy, username),
          eq(friends.friendStatus, "pending"),
        ),
      )
      .returning();

    if (!updated) {
      return Err(ErrorTypes.UnknownUsernameError);
    }

    return Ok(null);
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to decline friend request",
    );
    return Err(ErrorTypes.UpdateError);
  }
};

/**
 * Blocks a user.
 */
export const blockUser = async (
  username: string,
  friendUsername: string,
): Promise<
  Result<null, ErrorTypes.UnknownUsernameError | ErrorTypes.UpdateError>
> => {
  try {
    const recipient = await db.query.profiles.findFirst({
      where: { username: friendUsername },
    });
    if (!recipient) {
      return Err(ErrorTypes.UnknownUsernameError);
    }

    const [existing] = await db
      .select()
      .from(friends)
      .where(
        sql`((${friends.sentBy} = ${username} AND ${friends.receivedBy} = ${friendUsername}) OR (${friends.sentBy} = ${friendUsername} AND ${friends.receivedBy} = ${username}))`,
      )
      .limit(1);

    if (existing) {
      await db
        .update(friends)
        .set({
          sentBy: username,
          receivedBy: friendUsername,
          friendStatus: "blocked",
          requestAcceptedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          sql`((${friends.sentBy} = ${existing.sentBy} AND ${friends.receivedBy} = ${existing.receivedBy}))`,
        );
    } else {
      await db.insert(friends).values({
        sentBy: username,
        receivedBy: friendUsername,
        friendStatus: "blocked",
        requestAcceptedAt: new Date(),
      });
    }

    return Ok(null);
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to block user",
    );
    return Err(ErrorTypes.UpdateError);
  }
};

/**
 * Unblocks a user.
 */
export const unblockUser = async (
  username: string,
  friendUsername: string,
): Promise<
  Result<null, ErrorTypes.UnknownUsernameError | ErrorTypes.DeleteError>
> => {
  try {
    const deleted = await db
      .delete(friends)
      .where(
        and(
          eq(friends.sentBy, username),
          eq(friends.receivedBy, friendUsername),
          eq(friends.friendStatus, "blocked"),
        ),
      )
      .returning();

    if (deleted.length === 0) {
      return Err(ErrorTypes.UnknownUsernameError);
    }

    return Ok(null);
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to unblock user",
    );
    return Err(ErrorTypes.DeleteError);
  }
};

/**
 * Gets pending outgoing (sent) friend requests.
 */
export const getPendingSentFriendRequests = async (
  username: string,
): Promise<Result<any[], ErrorTypes.ConversionError>> => {
  try {
    const records = await db
      .select({
        username: profiles.username,
        photo: profiles.photo,
        description: profiles.description,
        userId: profiles.userId,
        createdAt: profiles.createdAt,
        updatedAt: profiles.updatedAt,
        requestSentAt: friends.requestSentAt,
      })
      .from(friends)
      .innerJoin(profiles, eq(friends.receivedBy, profiles.username))
      .where(
        and(eq(friends.sentBy, username), eq(friends.friendStatus, "pending")),
      );

    const formatted = records.map((r) => ({
      recipient: {
        username: r.username,
        photo: r.photo,
        description: r.description,
        userId: r.userId,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      },
      requestSentAt: r.requestSentAt.toISOString(),
    }));

    const checkSchema = Value.Convert(
      Type.Array(SentFriendRequestDTO),
      formatted,
    );
    if (Value.Check(Type.Array(SentFriendRequestDTO), checkSchema)) {
      return Ok(checkSchema as any[]);
    } else {
      app.log.error(
        Value.Errors(Type.Array(SentFriendRequestDTO), checkSchema),
      );
      return Err(ErrorTypes.ConversionError);
    }
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to fetch pending sent requests",
    );
    return Err(ErrorTypes.ConversionError);
  }
};
