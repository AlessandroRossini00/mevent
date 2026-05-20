import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import {
  CENTER,
  EMAIL_PREFIX,
  seedEvents,
  seedMemberships,
  seedUsers,
  TEST_PASSWORD,
} from "./explore-seed-data.mjs";

const envPath = path.resolve(process.cwd(), ".env.local");
const env = Object.fromEntries(
  fs
    .readFileSync(envPath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const [key, ...rest] = line.split("=");
      return [key, rest.join("=")];
    }),
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error(
    "Servono NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function withOffsetKm(baseLat, baseLon, northKm, eastKm) {
  const lat = baseLat + northKm / 111;
  const lon = baseLon + eastKm / (111 * Math.cos((baseLat * Math.PI) / 180));

  return {
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lon.toFixed(6)),
  };
}

async function listAllUsers() {
  const users = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) throw error;

    users.push(...data.users);

    if (data.users.length < perPage) break;
    page += 1;
  }

  return users;
}

async function createAuthUser({ email, password }) {
  const allUsers = await listAllUsers();
  const existing = allUsers.find((user) => user.email === email);

  if (existing) {
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) throw error;
  return data.user.id;
}

async function upsertProfile({
  id,
  username,
  full_name,
  birth_date,
  city,
  bio,
}) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id,
      username,
      full_name,
      birth_date,
      city,
      bio,
      avatar_url: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) throw error;
}

async function createUser(user) {
  const id = await createAuthUser({
    email: user.email,
    password: TEST_PASSWORD,
  });

  await upsertProfile({
    id,
    username: user.username,
    full_name: user.fullName,
    birth_date: user.birthDate,
    city: user.city,
    bio: user.bio,
  });

  return { id, ...user };
}

async function createEvent(event) {
  const { data, error } = await supabase
    .from("events")
    .insert({
      creator_id: event.creatorId,
      title: event.title,
      description: event.description,
      category: event.category,
      event_at: event.eventAt,
      location_name: event.locationName,
      address: event.address,
      latitude: event.latitude,
      longitude: event.longitude,
      price: event.price,
      maps_url: `https://www.google.com/maps?q=${event.latitude},${event.longitude}`,
      max_members: event.maxMembers,
      visibility: "public",
      approval_mode: "open",
      status: "active",
    })
    .select("id")
    .single();

  if (error) throw error;

  const { error: memberError } = await supabase.from("event_members").upsert(
    {
      event_id: data.id,
      user_id: event.creatorId,
      role: "admin",
    },
    { onConflict: "event_id,user_id" },
  );

  if (memberError) throw memberError;

  return data.id;
}

async function addMember(eventId, userId, role = "member") {
  const { error } = await supabase.from("event_members").upsert(
    {
      event_id: eventId,
      user_id: userId,
      role,
    },
    { onConflict: "event_id,user_id" },
  );

  if (error) throw error;
}

async function cleanupOldSeedData() {
  const allUsers = await listAllUsers();

  const seedUsers = allUsers.filter((user) =>
    user.email?.startsWith(`${EMAIL_PREFIX}+`),
  );

  const userIds = seedUsers.map((user) => user.id);

  if (userIds.length === 0) return;

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id")
    .in("creator_id", userIds);

  if (eventsError) throw eventsError;

  const eventIds = (events ?? []).map((event) => event.id);

  if (eventIds.length > 0) {
    const { error: deleteReadsError } = await supabase
      .from("event_message_reads")
      .delete()
      .in("event_id", eventIds);

    if (deleteReadsError) throw deleteReadsError;

    const { error: deleteMessagesError } = await supabase
      .from("event_messages")
      .delete()
      .in("event_id", eventIds);

    if (deleteMessagesError) throw deleteMessagesError;

    const { error: deleteRequestsError } = await supabase
      .from("event_join_requests")
      .delete()
      .in("event_id", eventIds);

    if (deleteRequestsError) throw deleteRequestsError;

    const { error: deleteMembersError } = await supabase
      .from("event_members")
      .delete()
      .in("event_id", eventIds);

    if (deleteMembersError) throw deleteMembersError;

    const { error: deleteImagesError } = await supabase
      .from("event_images")
      .delete()
      .in("event_id", eventIds);

    if (deleteImagesError) throw deleteImagesError;

    const { error: deleteEventsError } = await supabase
      .from("events")
      .delete()
      .in("id", eventIds);

    if (deleteEventsError) throw deleteEventsError;
  }

  const { error: deleteProfilesError } = await supabase
    .from("profiles")
    .delete()
    .in("id", userIds);

  if (deleteProfilesError) throw deleteProfilesError;

  for (const userId of userIds) {
    const { error: deleteUserError } =
      await supabase.auth.admin.deleteUser(userId);

    if (deleteUserError) throw deleteUserError;
  }
}

async function main() {
  console.log("Pulizia vecchi dati seed...");
  await cleanupOldSeedData();

  console.log("Creazione utenti test...");

  const createdUsers = new Map();

  for (const user of seedUsers) {
    const createdUser = await createUser(user);
    createdUsers.set(user.key, createdUser);
  }

  console.log("Creazione eventi dei nuovi utenti...");

  const createdEventIds = [];

  for (const definition of seedEvents) {
    const creator = createdUsers.get(definition.creatorKey);

    if (!creator) {
      throw new Error(`Creator non trovato per key: ${definition.creatorKey}`);
    }

    const eventId = await createEvent({
      creatorId: creator.id,
      title: definition.title,
      description: definition.description,
      category: definition.category,
      eventAt: addDays(definition.daysFromNow),
      locationName: definition.locationName,
      address: definition.address,
      ...withOffsetKm(
        CENTER.lat,
        CENTER.lon,
        definition.northKm,
        definition.eastKm,
      ),
      price: definition.price,
      maxMembers: definition.maxMembers,
    });

    createdEventIds.push(eventId);
  }

  console.log("Aggiunta membership viewer per test esclusione explore...");

  for (const membership of seedMemberships) {
    const user = createdUsers.get(membership.userKey);
    const eventId = createdEventIds[membership.eventIndex];

    if (!user) {
      throw new Error(`User non trovato per key: ${membership.userKey}`);
    }

    if (!eventId) {
      throw new Error(`Event non trovato per index: ${membership.eventIndex}`);
    }

    await addMember(eventId, user.id, membership.role);
  }

  const viewer = createdUsers.get("viewer");

  console.log("");
  console.log("Seed completato.");
  console.log(`Viewer login: ${viewer?.email}`);
  console.log(`Password: ${TEST_PASSWORD}`);
  console.log("");
  console.log(`Utenti creati: ${createdUsers.size}`);
  console.log(`Eventi creati: ${createdEventIds.length}`);
  console.log(`Membership aggiunte: ${seedMemberships.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
