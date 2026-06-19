import "dotenv/config";
import { createDbClient } from "./client";
import {
  events,
  friends,
  groupEvents,
  groupMembers,
  groups,
  plans,
  preferences,
  profiles,
  users,
  votes,
} from "./schemas";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5432/baza";
console.log(`Connecting to database at ${databaseUrl}...`);
const db = createDbClient(databaseUrl);

async function main() {
  console.log("Starting database seeding...");

  // 1. Clear existing data to avoid conflicts (cascade ensures clean slate)
  console.log("Cleaning up existing tables...");
  await db.delete(users);
  await db.delete(groups);
  await db.delete(events);

  // 2. Insert Users
  console.log("Seeding users...");
  const seededUsers = await db
    .insert(users)
    .values([
      {
        id: "usr_alice",
        name: "Alice Smith",
        email: "alice@example.com",
        emailVerified: true,
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
      },
      {
        id: "usr_bob",
        name: "Bob Jones",
        email: "bob@example.com",
        emailVerified: true,
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
      },
      {
        id: "usr_charlie",
        name: "Charlie Brown",
        email: "charlie@example.com",
        emailVerified: true,
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
      },
      {
        id: "usr_diana",
        name: "Diana Prince",
        email: "diana@example.com",
        emailVerified: true,
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diana",
      },
    ])
    .returning();

  // 3. Insert Profiles
  console.log("Seeding profiles...");
  await db.insert(profiles).values([
    {
      username: "alice_smith",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
      description: "Love hiking, planning, and organizing group trips!",
      settings: { theme: "dark", notifications: true },
      userId: "usr_alice",
    },
    {
      username: "bob_jones",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
      description: "Always down for outdoor adventures.",
      settings: { theme: "light", notifications: true },
      userId: "usr_bob",
    },
    {
      username: "charlie_brown",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
      description: "Good food, good planning, good times.",
      settings: { theme: "system", notifications: false },
      userId: "usr_charlie",
    },
    {
      username: "diana_prince",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diana",
      description: "Adventure seeker. Let's make plans!",
      settings: { theme: "dark", notifications: true },
      userId: "usr_diana",
    },
  ]);

  // 4. Insert Friends
  console.log("Seeding friends...");
  await db.insert(friends).values([
    {
      sentBy: "alice_smith",
      receivedBy: "bob_jones",
      friendStatus: "accepted",
      requestAcceptedAt: new Date(),
    },
    {
      sentBy: "alice_smith",
      receivedBy: "charlie_brown",
      friendStatus: "accepted",
      requestAcceptedAt: new Date(),
    },
    {
      sentBy: "bob_jones",
      receivedBy: "diana_prince",
      friendStatus: "accepted",
      requestAcceptedAt: new Date(),
    },
    {
      sentBy: "charlie_brown",
      receivedBy: "diana_prince",
      friendStatus: "pending",
    },
  ]);

  // 5. Insert Groups
  console.log("Seeding groups...");
  const [weekendGroup] = await db
    .insert(groups)
    .values([
      {
        groupname: "Weekend_Hikers",
        description:
          "For organizing weekly outdoor activities and weekend trails.",
        photo:
          "https://images.unsplash.com/photo-1551632811-561732d1e306?w=200",
      },
    ])
    .returning();

  if (!weekendGroup) {
    throw new Error("Failed to insert group");
  }

  // 6. Insert Group Members
  console.log("Seeding group members...");
  await db.insert(groupMembers).values([
    {
      username: "alice_smith",
      groupId: weekendGroup.id,
      admin: true,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      username: "bob_jones",
      groupId: weekendGroup.id,
      admin: false,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      username: "charlie_brown",
      groupId: weekendGroup.id,
      admin: false,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      username: "diana_prince",
      groupId: weekendGroup.id,
      admin: false,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  ]);

  // 7. Insert Events
  console.log("Seeding events & groupEvents...");

  // Event 1: Unfinished, voting open
  const [event1] = await db
    .insert(events)
    .values({
      title: "Summer Mountain Trek",
      description: "Our annual summer expedition to the mountains.",
    })
    .returning();

  const [ge1] = await db
    .insert(groupEvents)
    .values({
      id: event1!.id,
      groupId: weekendGroup.id,
      startDate: "2026-07-20",
      endDate: "2026-07-22",
      state: "unfinished",
      votingEndTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      createdBy: "alice_smith",
    })
    .returning();

  // Event 2: Needs tiebreaker (voting ended, ties exist)
  const [event2] = await db
    .insert(events)
    .values({
      title: "Weekend Bike Trail",
      description: "A quick bike trail adventure over the weekend.",
    })
    .returning();

  const [ge2] = await db
    .insert(groupEvents)
    .values({
      id: event2!.id,
      groupId: weekendGroup.id,
      startDate: "2026-06-15",
      endDate: "2026-06-16",
      state: "needs_tiebreaker",
      votingEndTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      createdBy: "alice_smith",
    })
    .returning();

  // 8. Insert Preferences for Event 1
  console.log("Seeding preferences...");
  await db.insert(preferences).values([
    {
      groupEventId: ge1!.id,
      username: "alice_smith",
      preference: {
        availableDates: ["2026-07-20", "2026-07-21"],
        activities: ["trekking", "camping"],
        minBudget: 50,
        maxBudget: 150,
      },
      private: false,
    },
    {
      groupEventId: ge1!.id,
      username: "bob_jones",
      preference: {
        availableDates: ["2026-07-21", "2026-07-22"],
        activities: ["trekking", "biking"],
        minBudget: 30,
        maxBudget: 100,
      },
      private: false,
    },
    {
      groupEventId: ge1!.id,
      username: "charlie_brown",
      preference: {
        availableDates: ["2026-07-20", "2026-07-21", "2026-07-22"],
        activities: ["camping"],
        minBudget: 80,
        maxBudget: 200,
      },
      private: true,
    },
  ]);

  // 9. Insert proposed plans for Event 1
  console.log("Seeding plan proposals...");
  const planProposals1 = await db
    .insert(plans)
    .values([
      {
        groupEventId: ge1!.id,
        username: "alice_smith",
        title: "Grand Canyon Trail Route A",
        date: "2026-07-20",
        startTime: "08:00:00",
        endTime: "16:00:00",
        activity: "Trekking & Camping at North Rim",
        location: "North Rim National Park",
        minBudget: 60,
        maxBudget: 120,
      },
      {
        groupEventId: ge1!.id,
        username: "bob_jones",
        title: "Sedona Red Rock Trail Route B",
        date: "2026-07-21",
        startTime: "09:00:00",
        endTime: "17:00:00",
        activity: "Scenic biking and canyon walk",
        location: "Sedona Red Rock Park",
        minBudget: 40,
        maxBudget: 90,
      },
    ])
    .returning();

  // 10. Insert proposed plans for Event 2 (Tied plans)
  const planProposals2 = await db
    .insert(plans)
    .values([
      {
        groupEventId: ge2!.id,
        username: "alice_smith",
        title: "Ocean View Trail",
        date: "2026-06-15",
        startTime: "10:00:00",
        endTime: "14:00:00",
        activity: "Coastal bike trail path",
        location: "Pacific Coast Highway Path",
        minBudget: 10,
        maxBudget: 30,
      },
      {
        groupEventId: ge2!.id,
        username: "bob_jones",
        title: "Mountain Foothills Path",
        date: "2026-06-15",
        startTime: "10:00:00",
        endTime: "14:00:00",
        activity: "Offroad biking trail",
        location: "Foothill Valley Park",
        minBudget: 15,
        maxBudget: 40,
      },
    ])
    .returning();

  // 11. Seed votes (simulating choices)
  console.log("Seeding votes...");
  // Votes for Event 1:
  // Alice votes Route A
  // Bob votes Route B
  // Charlie votes Route A
  await db.insert(votes).values([
    { planId: planProposals1[0]!.id, username: "alice_smith" },
    { planId: planProposals1[1]!.id, username: "bob_jones" },
    { planId: planProposals1[0]!.id, username: "charlie_brown" },
  ]);

  // Votes for Event 2 (Tied: 2 votes for Ocean View, 2 votes for Mountain Foothills):
  await db.insert(votes).values([
    { planId: planProposals2[0]!.id, username: "alice_smith" },
    { planId: planProposals2[0]!.id, username: "charlie_brown" },
    { planId: planProposals2[1]!.id, username: "bob_jones" },
    { planId: planProposals2[1]!.id, username: "diana_prince" },
  ]);

  console.log("Seeding completed successfully!");
}

main()
  .catch((err) => {
    console.error("Fatal error during seeding:", err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
