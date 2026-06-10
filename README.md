# Baza Fastify API Server Routes

This is a compiled reference of all backend routes registered on the Baza server.

---

## 👤 User / Profile Routes (Mounted at `/v1/restricted/users`)

| Method | Path | Description | Type |
| :--- | :--- | :--- | :--- |
| **GET** | `/:username` | Fetch public profile details | **[Original]** |
| **POST** | `/create` | Initialize user profile | **[Original]** |
| **DELETE** | `/:username/delete` | Delete user profile | **[Original]** |
| **PATCH** | `/:username/edit` | Edit user profile (username/bio) | **[Original]** |
| **GET** | `/:username/events` | List all user calendar events in a date window | **[Original]** |
| **GET** | `/:username/events/:idEvent` | Retrieve details of a specific personal event | **[AI Generated]** |
| **POST** | `/:username/events/create` | Create a new personal event | **[AI Generated]** |
| **PATCH** | `/:username/events/:idEvent/edit` | Modify personal event parameters | **[AI Generated]** |
| **GET** | `/:username/groups` | List all groups the user is active in | **[AI Generated]** |
| **GET** | `/:username/groups/:idGroup` | Retrieve details of a specific user group | **[AI Generated]** |
| **GET** | `/:username/groups/invites` | Retrieve pending group invitations | **[AI Generated]** |
| **POST** | `/:username/groups/invites/:groupId/accept` | Accept a group invitation | **[AI Generated]** |
| **POST** | `/:username/groups/invites/:groupId/decline` | Decline a group invitation | **[AI Generated]** |
| **GET** | `/:username/friends` | Retrieve accepted friends list | **[AI Generated]** |
| **GET** | `/:username/friends/:friendUsername` | Retrieve profile of an accepted friend | **[AI Generated]** |
| **POST** | `/:username/friends/:friendUsername/remove` | Unfriend/remove friendship | **[AI Generated]** |
| **DELETE** | `/:username/friends/:friendUsername/remove` | Unfriend/remove friendship | **[AI Generated]** |
| **POST** | `/:username/friends/sendRequest` | Send a new friend request | **[AI Generated]** |
| **GET** | `/:username/friends/requests` | List received pending friend requests | **[AI Generated]** |
| **POST** | `/:username/friends/requests/:senderUsername/accept` | Accept a friend request | **[AI Generated]** |
| **POST** | `/:username/friends/requests/:senderUsername/decline` | Decline a friend request | **[AI Generated]** |
| **GET** | `/:username/settings` | Retrieve user profile settings | **[AI Generated]** |
| **PATCH** | `/:username/settings` | Update user profile settings | **[AI Generated]** |

---

## 👥 Group / Event / Plan Routes (Mounted at `/v1/restricted/groups`)

| Method | Path | Description | Type |
| :--- | :--- | :--- | :--- |
| **GET** | `/:id` | Fetch group details | **[Original]** |
| **POST** | `/create` | Create a new group | **[Original]** |
| **DELETE** | `/:id/delete` | Delete a group | **[Original]** |
| **PATCH** | `/:id/edit` | Edit group details (name/description) | **[Original]** |
| **PATCH** | `/:id/edit/photo` | Upload group profile icon | **[Original]** |
| **GET** | `/:id/photo` | Download group profile icon | **[Original]** |
| **POST** | `/:id/group-members/invite-user` | Invite a user to the group | **[Original]** |
| **POST** | `/:id/group-members/remove-user` | Kick/remove member from group | **[Original]** |
| **GET** | `/:id/group-members` | List group members (with invite/ban status) | **[Original]** |
| **PATCH** | `/:id/group-members/:username/promote-to-admin` | Promote member to group admin | **[AI Generated]** |
| **PATCH** | `/:id/group-members/:username/dismiss-admin` | Remove admin status from member | **[AI Generated]** |
| **POST** | `/:id/events/create` | Create group event with voting deadline | **[AI Generated]** |
| **GET** | `/:id/events` | List all group events | **[AI Generated]** |
| **GET** | `/:id/calendar` | Fetch combined group calendar (overlaps & masking) | **[AI Generated]** |
| **GET** | `/:id/events/:idevent` | Retrieve details of a specific group event | **[AI Generated]** |
| **PATCH** | `/:id/events/:idevent/edit` | Modify group event parameters | **[AI Generated]** |
| **POST** | `/:id/events/:idevent/resolve-tie` | Break a tie between voting plans | **[AI Generated]** |
| **POST** | `/:id/events/:idevent/preferences/create` | Submit user planning preferences for event | **[AI Generated]** |
| **GET** | `/:id/events/:idevent/preferences/group` | Get aggregated group preference report | **[AI Generated]** |
| **GET** | `/:id/events/:idevent/preferences/all` | Get all member preferences (respects privacy) | **[AI Generated]** |
| **GET** | `/:id/events/:idevent/preferences/:username` | Get specific member preference | **[AI Generated]** |
| **GET** | `/:id/events/:idevent/plans` | Fetch proposed plans list with votes | **[AI Generated]** |
| **POST** | `/:id/events/:idevent/plans/create` | Propose a plan for the group event | **[AI Generated]** |
| **GET** | `/:id/events/:idevent/plans/:idplan` | Get details of a proposed plan | **[AI Generated]** |
| **PATCH** | `/:id/events/:idevent/plans/:idplan/edit` | Edit proposed plan coordinates | **[AI Generated]** |
| **POST** | `/:id/events/:idevent/plans/:idplan/vote` | Approve a plan proposal | **[AI Generated]** |
| **POST** | `/:id/events/:idevent/plans/:idplan/remove-vote` | Remove approval from plan proposal | **[AI Generated]** |