import { eventService } from "@/services/eventService";
import { apiClient } from "@/services/apiClient";
import { Ok, Err, createStatusError, ErrorTypes } from "@baza/shared-types";

jest.mock("@/lib/env", () => ({
  env: {
    EXPO_PUBLIC_SERVER_URL: "http://mock-server.com",
    EXPO_PUBLIC_BYPASS_AUTH: "false",
  },
}));

jest.mock("@/services/apiClient", () => {
  const actual = jest.requireActual("@/services/apiClient");
  return {
    ...actual,
    apiClient: jest.fn(),
  };
});

describe("eventService", () => {
  const mockPersonalEvent = {
    id: "event-123",
    title: "Mock Personal Event",
    description: "Personal Desc",
    date: "2026-07-02",
    location: "Home",
    startTime: "2026-07-02T09:00:00.000Z",
    endTime: "2026-07-02T10:00:00.000Z",
    allDay: false,
    repeat: "never",
    repeatUntil: null,
    public: false,
  };

  const mockGroupEvent = {
    id: "group-event-123",
    title: "Mock Group Event",
    description: "Group Desc",
    startDate: "2026-07-02T00:00:00.000Z",
    endDate: "2026-07-03T00:00:00.000Z",
    finished: false,
    votingEndTime: "2026-07-02T12:00:00.000Z",
    createdBy: "johndoe",
  };

  const mockError = createStatusError(
    ErrorTypes.DeleteError,
    "Database execution failed",
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Personal Events", () => {
    it("should get personal events", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: [mockPersonalEvent] }),
      );

      const result = await eventService.getPersonalEvents("johndoe", {
        startDate: "2026-07-01",
        endDate: "2026-07-03",
      });

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/users/johndoe/events",
        {
          params: { startDate: "2026-07-01", endDate: "2026-07-03" },
        },
      );
      expect(result).toEqual(Ok([mockPersonalEvent]));
    });

    it("should get a single personal event", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: mockPersonalEvent }),
      );

      const result = await eventService.getPersonalEvent("johndoe", "event-123");

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/users/johndoe/events/event-123",
      );
      expect(result).toEqual(Ok(mockPersonalEvent));
    });

    it("should create a personal event", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: mockPersonalEvent }),
      );

      const body = {
        title: "Mock Personal Event",
        date: "2026-07-02",
        startTime: "2026-07-02T09:00:00.000Z",
        endTime: "2026-07-02T10:00:00.000Z",
        allDay: false,
        repeat: "never" as const,
        public: false,
      };
      const result = await eventService.createPersonalEvent("johndoe", body);

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/users/johndoe/events",
        {
          method: "POST",
          json: body,
        },
      );
      expect(result).toEqual(Ok(mockPersonalEvent));
    });

    it("should edit a personal event", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: mockPersonalEvent }),
      );

      const body = { title: "Updated Title" };
      const result = await eventService.editPersonalEvent(
        "johndoe",
        "event-123",
        body,
      );

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/users/johndoe/events/event-123",
        {
          method: "PATCH",
          json: body,
        },
      );
      expect(result).toEqual(Ok(mockPersonalEvent));
    });

    it("should delete a personal event successfully", async () => {
      (apiClient as jest.Mock).mockResolvedValue(Ok({ status: "OK", data: null }));

      const result = await eventService.deletePersonalEvent(
        "johndoe",
        "event-123",
      );

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/users/johndoe/events/event-123",
        {
          method: "DELETE",
        },
      );
      expect(result).toEqual(Ok(null));
    });

    it("should return an error when deleting a personal event fails", async () => {
      (apiClient as jest.Mock).mockResolvedValue(Err(mockError));

      const result = await eventService.deletePersonalEvent(
        "johndoe",
        "event-123",
      );

      expect(result).toEqual(Err(mockError));
    });
  });

  describe("Group Events", () => {
    it("should create a group event", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: mockGroupEvent }),
      );

      const body = {
        title: "Mock Group Event",
        startDate: "2026-07-02T00:00:00.000Z",
        endDate: "2026-07-03T00:00:00.000Z",
        votingEndTime: "2026-07-02T12:00:00.000Z",
      };
      const result = await eventService.createGroupEvent("group-456", body);

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/groups/group-456/events",
        {
          method: "POST",
          json: body,
        },
      );
      expect(result).toEqual(Ok(mockGroupEvent));
    });

    it("should list group events", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: [mockGroupEvent] }),
      );

      const result = await eventService.listGroupEvents("group-456", {
        startDate: "2026-07-01",
        endDate: "2026-07-03",
      });

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/groups/group-456/events",
        {
          params: { startDate: "2026-07-01", endDate: "2026-07-03" },
        },
      );
      expect(result).toEqual(Ok([mockGroupEvent]));
    });

    it("should get group calendar", async () => {
      const mockCalendar = { groupEvents: [], membersEvents: [] };
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: mockCalendar }),
      );

      const result = await eventService.getGroupCalendar("group-456", {
        startDate: "2026-07-01",
        endDate: "2026-07-03",
      });

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/groups/group-456/calendar",
        {
          params: { startDate: "2026-07-01", endDate: "2026-07-03" },
        },
      );
      expect(result).toEqual(Ok(mockCalendar));
    });

    it("should get a group event", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: mockGroupEvent }),
      );

      const result = await eventService.getGroupEvent(
        "group-456",
        "group-event-123",
      );

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/groups/group-456/events/group-event-123",
      );
      expect(result).toEqual(Ok(mockGroupEvent));
    });

    it("should edit a group event", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: mockGroupEvent }),
      );

      const body = { title: "Updated Group Event Title" };
      const result = await eventService.editGroupEvent(
        "group-456",
        "group-event-123",
        body,
      );

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/groups/group-456/events/group-event-123",
        {
          method: "PATCH",
          json: body,
        },
      );
      expect(result).toEqual(Ok(mockGroupEvent));
    });

    it("should delete a group event successfully", async () => {
      (apiClient as jest.Mock).mockResolvedValue(Ok({ status: "OK", data: null }));

      const result = await eventService.deleteGroupEvent(
        "group-456",
        "group-event-123",
      );

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/groups/group-456/events/group-event-123",
        {
          method: "DELETE",
        },
      );
      expect(result).toEqual(Ok(null));
    });

    it("should return an error when deleting a group event fails", async () => {
      (apiClient as jest.Mock).mockResolvedValue(Err(mockError));

      const result = await eventService.deleteGroupEvent(
        "group-456",
        "group-event-123",
      );

      expect(result).toEqual(Err(mockError));
    });

    it("should resolve a tie-breaker", async () => {
      const mockResult = { message: "Tie resolved" };
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: mockResult }),
      );

      const body = { planId: "plan-789" };
      const result = await eventService.resolveTie(
        "group-456",
        "group-event-123",
        body,
      );

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/groups/group-456/events/group-event-123/resolve-tie",
        {
          method: "POST",
          json: body,
        },
      );
      expect(result).toEqual(Ok(mockResult));
    });
  });

  describe("Attendance Confirmations", () => {
    const mockConfirmation = {
      groupId: "group-456",
      username: "johndoe",
      groupEventId: "group-event-123",
      confirmed: true,
    };

    it("should confirm event attendance", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: mockConfirmation }),
      );

      const result = await eventService.confirmEventAttendance(
        "group-456",
        "group-event-123",
      );

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/groups/group-456/events/group-event-123/confirmations",
        {
          method: "POST",
        },
      );
      expect(result).toEqual(Ok(mockConfirmation));
    });

    it("should revoke event attendance", async () => {
      (apiClient as jest.Mock).mockResolvedValue(Ok({ status: "OK", data: null }));

      const result = await eventService.revokeEventAttendance(
        "group-456",
        "group-event-123",
      );

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/groups/group-456/events/group-event-123/confirmations",
        {
          method: "DELETE",
        },
      );
      expect(result).toEqual(Ok(null));
    });

    it("should list event confirmations", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: [mockConfirmation] }),
      );

      const result = await eventService.getEventConfirmations(
        "group-456",
        "group-event-123",
      );

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/groups/group-456/events/group-event-123/confirmations",
      );
      expect(result).toEqual(Ok([mockConfirmation]));
    });
  });

  describe("Planning Preferences", () => {
    const mockPreference = {
      username: "johndoe",
      groupEventId: "group-event-123",
      preference: {},
      private: false,
    };

    it("should create/edit preference", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: mockPreference }),
      );

      const body = { preference: {}, private: false };
      const result = await eventService.createOrEditEventPreference(
        "group-456",
        "group-event-123",
        body,
      );

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/groups/group-456/events/group-event-123/preferences",
        {
          method: "POST",
          json: body,
        },
      );
      expect(result).toEqual(Ok(mockPreference));
    });

    it("should get group preference report", async () => {
      const mockReport = { report: {} };
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: mockReport }),
      );

      const result = await eventService.getGroupPreferenceReport(
        "group-456",
        "group-event-123",
      );

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/groups/group-456/events/group-event-123/preferences/group",
      );
      expect(result).toEqual(Ok(mockReport));
    });

    it("should get all event preferences", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: [mockPreference] }),
      );

      const result = await eventService.getAllEventPreferences(
        "group-456",
        "group-event-123",
      );

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/groups/group-456/events/group-event-123/preferences",
      );
      expect(result).toEqual(Ok([mockPreference]));
    });

    it("should get user preference", async () => {
      (apiClient as jest.Mock).mockResolvedValue(
        Ok({ status: "OK", data: mockPreference }),
      );

      const result = await eventService.getUserPreference(
        "group-456",
        "group-event-123",
        "johndoe",
      );

      expect(apiClient).toHaveBeenCalledWith(
        "/v1/restricted/groups/group-456/events/group-event-123/preferences/johndoe",
      );
      expect(result).toEqual(Ok(mockPreference));
    });
  });
});
