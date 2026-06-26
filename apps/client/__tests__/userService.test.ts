jest.mock("@/lib/env", () => ({
  env: {
    EXPO_PUBLIC_SERVER_URL: "http://mock-server.com",
    EXPO_PUBLIC_BYPASS_AUTH: "false",
  },
}));

import { userService } from "@/services/userService";
import { apiClient } from "@/services/apiClient";
import { Ok, Err, createStatusError, ErrorTypes } from "@baza/shared-types";

jest.mock("@/services/apiClient", () => {
  const actual = jest.requireActual("@/services/apiClient");
  return {
    ...actual,
    apiClient: jest.fn(),
  };
});

describe("userService", () => {
  const mockProfile = {
    username: "johndoe",
    userId: "user-123",
    description: "Mock Bio",
    photo: null,
    settings: {},
  };

  const mockError = createStatusError(
    ErrorTypes.UnknownUsernameError,
    "User not found"
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProfile", () => {
    it("should retrieve a user profile successfully", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: mockProfile })
      );

      const result = await userService.getProfile("johndoe");

      expect(apiClient).toHaveBeenCalledWith("/v1/restricted/users/johndoe");
      expect(result).toEqual(Ok(mockProfile));
    });

    it("should return an error when retrieval fails", async () => {
      (apiClient as jest.Mock).mockResolvedValue(Err(mockError));

      const result = await userService.getProfile("johndoe");

      expect(result).toEqual(Err(mockError));
    });
  });

  describe("getCurrentProfile", () => {
    it("should retrieve the current user profile successfully", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: mockProfile })
      );

      const result = await userService.getCurrentProfile();

      expect(apiClient).toHaveBeenCalledWith("/v1/restricted/users/me");
      expect(result).toEqual(Ok(mockProfile));
    });

    it("should return an error when retrieving current profile fails", async () => {
      (apiClient as jest.Mock).mockResolvedValue(Err(mockError));

      const result = await userService.getCurrentProfile();

      expect(result).toEqual(Err(mockError));
    });
  });

  describe("createProfile", () => {
    const body = { userId: "user-123", username: "johndoe" };

    it("should create a profile successfully", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: mockProfile })
      );

      const result = await userService.createProfile(body);

      expect(apiClient).toHaveBeenCalledWith("/v1/restricted/users", {
        method: "POST",
        json: body,
      });
      expect(result).toEqual(Ok(mockProfile));
    });

    it("should return an error when creation fails", async () => {
      (apiClient as jest.Mock).mockResolvedValue(Err(mockError));

      const result = await userService.createProfile(body);

      expect(result).toEqual(Err(mockError));
    });
  });

  describe("deleteProfile", () => {
    it("should delete profile successfully", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: mockProfile })
      );

      const result = await userService.deleteProfile("johndoe");

      expect(apiClient).toHaveBeenCalledWith("/v1/restricted/users/johndoe", {
        method: "DELETE",
      });
      expect(result).toEqual(Ok(mockProfile));
    });

    it("should return an error when deletion fails", async () => {
      (apiClient as jest.Mock).mockResolvedValue(Err(mockError));

      const result = await userService.deleteProfile("johndoe");

      expect(result).toEqual(Err(mockError));
    });
  });

  describe("editProfile", () => {
    const body = { newUsername: "john_doe", newDescription: "New description" };

    it("should edit profile successfully", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: mockProfile })
      );

      const result = await userService.editProfile("johndoe", body);

      expect(apiClient).toHaveBeenCalledWith("/v1/restricted/users/johndoe", {
        method: "PATCH",
        json: body,
      });
      expect(result).toEqual(Ok(mockProfile));
    });

    it("should return an error when edit fails", async () => {
      (apiClient as jest.Mock).mockResolvedValue(Err(mockError));

      const result = await userService.editProfile("johndoe", body);

      expect(result).toEqual(Err(mockError));
    });
  });

  describe("getFriends", () => {
    const mockFriends = [mockProfile];

    it("should retrieve friends list successfully", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: mockFriends })
      );

      const result = await userService.getFriends("johndoe");

      expect(apiClient).toHaveBeenCalledWith("/v1/restricted/users/johndoe/friends");
      expect(result).toEqual(Ok(mockFriends));
    });

    it("should return an error when retrieving friends fails", async () => {
      (apiClient as jest.Mock).mockResolvedValue(Err(mockError));

      const result = await userService.getFriends("johndoe");

      expect(result).toEqual(Err(mockError));
    });
  });

  describe("getFriendProfile", () => {
    it("should retrieve friend profile successfully", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: mockProfile })
      );

      const result = await userService.getFriendProfile("usera", "userb");

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/users/usera/friends/userb"
      );
      expect(result).toEqual(Ok(mockProfile));
    });

    it("should return an error when retrieving friend profile fails", async () => {
      (apiClient as jest.Mock).mockResolvedValue(Err(mockError));

      const result = await userService.getFriendProfile("usera", "userb");

      expect(result).toEqual(Err(mockError));
    });
  });

  describe("removeFriend", () => {
    it("should remove friend successfully", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: null })
      );

      const result = await userService.removeFriend("usera", "userb");

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/users/usera/friends/userb",
        { method: "DELETE" }
      );
      expect(result).toEqual(Ok(null));
    });

    it("should return an error when removing friend fails", async () => {
      (apiClient as jest.Mock).mockResolvedValue(Err(mockError));

      const result = await userService.removeFriend("usera", "userb");

      expect(result).toEqual(Err(mockError));
    });
  });

  describe("sendFriendRequest", () => {
    const body = { recipientUsername: "userb" };

    it("should send friend request successfully", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: null })
      );

      const result = await userService.sendFriendRequest("usera", body);

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/users/usera/friends/requests",
        { method: "POST", json: body }
      );
      expect(result).toEqual(Ok(null));
    });

    it("should return an error when sending friend request fails", async () => {
      (apiClient as jest.Mock).mockResolvedValue(Err(mockError));

      const result = await userService.sendFriendRequest("usera", body);

      expect(result).toEqual(Err(mockError));
    });
  });

  describe("getPendingFriendRequests", () => {
    const mockRequests = [{ sender: mockProfile, id: "req-1", status: "pending" }];

    it("should retrieve pending friend requests successfully", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: mockRequests })
      );

      const result = await userService.getPendingFriendRequests("usera");

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/users/usera/friends/requests"
      );
      expect(result).toEqual(Ok(mockRequests));
    });

    it("should return an error when retrieving requests fails", async () => {
      (apiClient as jest.Mock).mockResolvedValue(Err(mockError));

      const result = await userService.getPendingFriendRequests("usera");

      expect(result).toEqual(Err(mockError));
    });
  });

  describe("getPendingSentFriendRequests", () => {
    const mockSentRequests = [{ recipient: mockProfile, id: "req-1", status: "pending" }];

    it("should retrieve pending sent requests successfully", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: mockSentRequests })
      );

      const result = await userService.getPendingSentFriendRequests("usera");

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/users/usera/friends/requests/sent"
      );
      expect(result).toEqual(Ok(mockSentRequests));
    });

    it("should return an error when retrieving sent requests fails", async () => {
      (apiClient as jest.Mock).mockResolvedValue(Err(mockError));

      const result = await userService.getPendingSentFriendRequests("usera");

      expect(result).toEqual(Err(mockError));
    });
  });

  describe("respondFriendRequest", () => {
    const body = { status: "accepted" as const };

    it("should respond to friend request successfully", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: null })
      );

      const result = await userService.respondFriendRequest("userb", "usera", body);

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/users/userb/friends/requests/usera",
        { method: "PATCH", json: body }
      );
      expect(result).toEqual(Ok(null));
    });

    it("should return an error when responding fails", async () => {
      (apiClient as jest.Mock).mockResolvedValue(Err(mockError));

      const result = await userService.respondFriendRequest("userb", "usera", body);

      expect(result).toEqual(Err(mockError));
    });
  });

  describe("blockUser", () => {
    const body = { blockedUsername: "userb" };

    it("should block user successfully", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: null })
      );

      const result = await userService.blockUser("usera", body);

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/users/usera/blocks",
        { method: "POST", json: body }
      );
      expect(result).toEqual(Ok(null));
    });

    it("should return an error when blocking fails", async () => {
      (apiClient as jest.Mock).mockResolvedValue(Err(mockError));

      const result = await userService.blockUser("usera", body);

      expect(result).toEqual(Err(mockError));
    });
  });

  describe("unblockUser", () => {
    it("should unblock user successfully", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: null })
      );

      const result = await userService.unblockUser("usera", "userb");

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/users/usera/blocks/userb",
        { method: "DELETE" }
      );
      expect(result).toEqual(Ok(null));
    });

    it("should return an error when unblocking fails", async () => {
      (apiClient as jest.Mock).mockResolvedValue(Err(mockError));

      const result = await userService.unblockUser("usera", "userb");

      expect(result).toEqual(Err(mockError));
    });
  });

  describe("getSettings", () => {
    const settings = { theme: "dark" };

    it("should retrieve settings successfully", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: settings })
      );

      const result = await userService.getSettings("johndoe");

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/users/johndoe/settings"
      );
      expect(result).toEqual(Ok(settings));
    });

    it("should return an error when retrieving settings fails", async () => {
      (apiClient as jest.Mock).mockResolvedValue(Err(mockError));

      const result = await userService.getSettings("johndoe");

      expect(result).toEqual(Err(mockError));
    });
  });

  describe("updateSettings", () => {
    const settings = { theme: "light" };

    it("should update settings successfully", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: settings })
      );

      const result = await userService.updateSettings("johndoe", settings);

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/users/johndoe/settings",
        { method: "PATCH", json: settings }
      );
      expect(result).toEqual(Ok(settings));
    });

    it("should return an error when updating settings fails", async () => {
      (apiClient as jest.Mock).mockResolvedValue(Err(mockError));

      const result = await userService.updateSettings("johndoe", settings);

      expect(result).toEqual(Err(mockError));
    });
  });
});
