# Baza Developer Guide

Baza is a collaborative scheduling and planning application that enables users to form groups, propose plans, vote on events, share calendars, and manage coordinates.

---

## Workspace Structure

The project is structured as a monorepo managed with pnpm workspaces.

- **apps/client**: Expo React Native mobile client (SDK 55).
- **apps/server**: Fastify backend API.
- **packages/db**: Drizzle ORM client, database schemas, and migration files.
- **packages/shared**: Shared types and Typebox schemas for DTO and payload validation.
- **docs**: Project reference materials.

---

## Development Scripts

Run these scripts from the monorepo root:

- `pnpm dev:server`: Start the Fastify backend server.
- `pnpm dev:client`: Start the Expo mobile client.
- `pnpm db:studio`: Open the Drizzle Studio database viewer.
- `pnpm db:generate`: Generate SQL migration files based on schema changes.
- `pnpm db:migrate`: Run database migrations.
- `pnpm db:seed`: Seed the development database.
- `pnpm test:server`: Run the Fastify backend test suite.
- `pnpm lint`: Run linting across all workspace packages.

---

## Database Management

We use PostgreSQL with Drizzle ORM.

### Schema Changes

1. Modify schema definitions in `packages/db/src/schemas/`.
2. Generate migration script: `pnpm db:generate`
3. Apply migration to your database: `pnpm db:migrate`

### Test Database Isolation

Tests run sequentially on an isolated database named `baza_test`. The test framework automatically checks for, creates, and runs migrations on `baza_test` before running tests. This prevents test runs from polluting or modifying your development database.

---

## Developer Conventions

- **Imports**: Use workspace imports (`@baza/db`, `@baza/shared-types`) rather than relative relative path references when importing across packages. Use `@/` for local application pathing.
- **Time Serialization**: When returning PostgreSQL `TIME` fields (timezone-less strings like `"HH:MM:SS"`), append a `"Z"` offset suffix (e.g. `"HH:MM:SSZ"`) to conform to TypeBox's `format: "time"` schema checks.
- **DateTime Fields**: Personal calendar event times return as Javascript `Date` objects from Drizzle. Convert them to ISO strings (`.toISOString()`) to satisfy the Typebox `format: "date-time"` requirements.
- **Error Handling**: API client requests normalize non-conforming responses automatically. Service layers should validate constraints (like budget boundaries or start/end times) before hitting the database, returning `400 Bad Request` payloads on violation.

---

## Backend API Routes

The backend API routes registered on the server are detailed below.

### User / Profile Routes (Mounted at `/v1/restricted/users`)

| Method     | Path                                          | Description                                             |
| :--------- | :-------------------------------------------- | :------------------------------------------------------ |
| **POST**   | `/`                                           | Initialize user profile                                 |
| **GET**    | `/me`                                         | Fetch authenticated user profile                        |
| **GET**    | `/:username`                                  | Fetch public profile details                            |
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

### Group / Event / Plan Routes (Mounted at `/v1/restricted/groups`)

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
