# Baza Fastify API Server Routes

This is a compiled reference of all backend routes registered on the Baza server.

---

## 👤 User / Profile Routes (Mounted at `/v1/restricted/users`)

| Method     | Path                                          | Description                                             |
| :--------- | :-------------------------------------------- | :------------------------------------------------------ |
| **GET**    | `/:username`                                  | Fetch public profile details                            |
| **POST**   | `/`                                           | Initialize user profile                                 |
| **DELETE** | `/:username`                                  | Delete user profile                                     |
| **PATCH**  | `/:username`                                  | Edit user profile (username/bio)                        |
| **GET**    | `/:username/events`                           | List all user calendar events in a date window          |
| **GET**    | `/:username/events/:idEvent`                  | Retrieve details of a specific personal event           |
| **POST**   | `/:username/events`                           | Create a new personal event                             |
| **PATCH**  | `/:username/events/:idEvent`                  | Modify personal event parameters                        |
| **GET**    | `/:username/groups`                           | List all groups the user is active in                   |
| **GET**    | `/:username/groups/invites`                   | Retrieve pending group invitations                      |
| **PATCH**  | `/:username/groups/invites/:groupId`          | Respond (accept or decline) to a group invitation       |
| **GET**    | `/:username/friends`                          | Retrieve accepted friends list                          |
| **GET**    | `/:username/friends/:friendUsername`          | Retrieve profile of an accepted friend                  |
| **DELETE** | `/:username/friends/:friendUsername`          | Unfriend/remove friendship                              |
| **POST**   | `/:username/friends/requests`                 | Send a new friend request                               |
| **GET**    | `/:username/friends/requests`                 | List received pending friend requests                   |
| **GET**    | `/:username/friends/requests/sent`            | List outgoing pending friend requests                   |
| **PATCH**  | `/:username/friends/requests/:senderUsername` | Respond (accept or decline) to a pending friend request |
| **POST**   | `/:username/blocks`                           | Block a user                                            |
| **DELETE** | `/:username/blocks/:blockedUsername`          | Unblock a user                                          |
| **GET**    | `/:username/settings`                         | Retrieve user profile settings                          |
| **PATCH**  | `/:username/settings`                         | Update user profile settings                            |

---

## 👥 Group / Event / Plan Routes (Mounted at `/v1/restricted/groups`)

| Method     | Path                                         | Description                                        |
| :--------- | :------------------------------------------- | :------------------------------------------------- |
| **GET**    | `/:id`                                       | Fetch group details                                |
| **POST**   | `/`                                          | Create a new group                                 |
| **DELETE** | `/:id`                                       | Delete a group                                     |
| **PATCH**  | `/:id`                                       | Edit group details (name/description)              |
| **PATCH**  | `/:id/photo`                                 | Upload group profile icon                          |
| **GET**    | `/:id/photo`                                 | Download group profile icon                        |
| **POST**   | `/:id/group-members`                         | Invite a user to the group                         |
| **DELETE** | `/:id/group-members/:username`               | Kick/remove member from group                      |
| **GET**    | `/:id/group-members`                         | List group members (with invite/ban status)        |
| **PATCH**  | `/:id/group-members/:username`               | Update a member's role (admin status)              |
| **POST**   | `/:id/events`                                | Create group event with voting deadline            |
| **GET**    | `/:id/events`                                | List all group events                              |
| **GET**    | `/:id/calendar`                              | Fetch combined group calendar (overlaps & masking) |
| **GET**    | `/:id/events/:idevent`                       | Retrieve details of a specific group event         |
| **PATCH**  | `/:id/events/:idevent`                       | Modify group event parameters                      |
| **POST**   | `/:id/events/:idevent/resolve-tie`           | Break a tie between voting plans                   |
| **POST**   | `/:id/events/:idevent/preferences`           | Submit user planning preferences for event         |
| **GET**    | `/:id/events/:idevent/preferences/group`     | Get aggregated group preference report             |
| **GET**    | `/:id/events/:idevent/preferences`           | Get all member preferences (respects privacy)      |
| **GET**    | `/:id/events/:idevent/preferences/:username` | Get specific member preference                     |
| **GET**    | `/:id/events/:idevent/plans`                 | Fetch proposed plans list with votes               |
| **POST**   | `/:id/events/:idevent/plans`                 | Propose a plan for the group event                 |
| **GET**    | `/:id/events/:idevent/plans/:idplan`         | Get details of a proposed plan                     |
| **PATCH**  | `/:id/events/:idevent/plans/:idplan`         | Edit proposed plan coordinates                     |
| **POST**   | `/:id/events/:idevent/plans/:idplan/votes`   | Approve a plan proposal                            |
| **DELETE** | `/:id/events/:idevent/plans/:idplan/votes`   | Remove approval from plan proposal                 |
| **POST**   | `/:id/events/:idevent/confirmations`         | Confirm attendance for group event                 |
| **DELETE** | `/:id/events/:idevent/confirmations`         | Revoke attendance confirmation                     |
| **GET**    | `/:id/events/:idevent/confirmations`         | Retrieve all attendance confirmations              |
