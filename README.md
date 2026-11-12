# Member Fitness Dashboard — Multi-Gym Platform

A simplified member fitness dashboard for a multi-gym chain. Members view activity
across gym locations, track class bookings, and see their workout streak — powered by
a **Fastify + TypeScript** backend and a **React Native (Expo SDK 58)** app.

```
.
├── backend/   Fastify + TypeScript REST API (in-memory store)
└── mobile/    Expo Router app (Dashboard + Class Booking screens)
```

## Tech stack

| Layer    | Choice                                              |
| -------- | --------------------------------------------------- |
| Backend  | Fastify 5, TypeScript (strict), Vitest, tsx         |
| Mobile   | Expo SDK 58 (React Native 0.88, React 19.3), Expo Router, Jest + jest-expo, React Native Testing Library |

---

## Backend

### Setup

```bash
cd backend
npm install
npm start        # starts on http://localhost:3000
npm test         # run Vitest suite
npm run build    # type-check + emit to dist/
```

The store is in-memory and pre-seeded with **3 gyms, 5 members, 10 classes** on boot
(`src/stores/dataStore.ts`). Restarting resets all data.

### API reference

Base URL: `http://localhost:3000`

#### Members

**`GET /api/members/:id`** — member profile

```json
{
  "id": "m-1", "name": "Thandiwe Mokoena", "email": "thandiwe@example.com",
  "tier": "elite", "homeGymId": "gym-1", "joinDate": "2024-03-01",
  "preferredGymId": "gym-1",
  "notifications": { "classReminders": true, "streakAlerts": true }
}
```

**`GET /api/members/:id/stats`** — aggregated statistics

```json
{ "totalVisits": 3, "currentStreak": 3, "favoriteGymId": "gym-1", "classesAttended": 2 }
```

**`PUT /api/members/:id/preferences`** — update preferences

```jsonc
// request body
{
  "preferredGymId": "gym-2",
  "notifications": { "classReminders": false, "streakAlerts": true }
}
```
Both fields optional. `preferredGymId` must reference an existing gym (else `400`).

**`GET /api/members/:id/bookings`** — upcoming bookings (future classes, sorted)

**`GET /api/members/:id/check-ins`** — check-in history (last 30 days) + streak

```json
{ "checkIns": [ /* ... */ ], "streak": 3 }
```

#### Classes

**`GET /api/gyms/:gymId/classes`** — classes for a gym

Optional query: `?date=2024-01-15` and/or `?type=yoga|hiit|spin`.

```json
[
  {
    "id": "c-1", "gymId": "gym-1", "name": "Sunrise Yoga",
    "instructor": "Maya Reed", "type": "yoga",
    "startsAt": "2026-11-13T04:30:00.000Z",
    "capacity": 20, "bookedMemberIds": ["m-3"]
  }
]
```

**`POST /api/classes/:classId/book`** — book a class → `201`

Body: `{ "memberId": "m-1" }`. Validates: class exists, is in the future, not already
booked by this member, not full.

**`DELETE /api/classes/:classId/book/:memberId`** — cancel a booking

#### Check-ins

**`POST /api/check-in`** — record a visit → `201`

Body: `{ "memberId": "m-1", "gymId": "gym-1" }`. Rejects a duplicate check-in within
**1 hour** (`409`).

### Error model

Every error returns a consistent shape:

```json
{ "error": "CONFLICT", "message": "Class is full", "statusCode": 409 }
```

| Status | When                                                        |
| ------ | ----------------------------------------------------------- |
| `400`  | Validation failure (bad/missing body, unknown gym in prefs) |
| `404`  | Member / gym / class / booking not found                    |
| `409`  | Conflict: duplicate check-in, double booking, class full    |

### Streak calculation

`src/services/streak.ts` reduces check-ins to a set of calendar days, then walks
backwards from today counting consecutive days. A streak ending **yesterday** is still
considered active (grace period); a gap of a full day breaks it. Multiple check-ins on
the same day count once.

---

## Mobile (Expo SDK 58)

### Setup

```bash
cd mobile
npm install
npm start        # Expo dev server — press i / a / w, or scan the QR
npm test         # run Jest + RNTL suite
```

> **Point the app at the API.** By default the client auto-detects the right host
> (`src/api/client.ts`): on a device or simulator it reuses the LAN IP that Expo already
> serves the bundle from and targets port `3000`, so a physical iPhone **works with no
> config** as long as it shares Wi-Fi with your Mac. To force a specific URL, set
> `expo.extra.apiBaseUrl` in `app.json` (e.g. `http://192.168.0.10:3000`) — when present
> it overrides auto-detection. The seeded "current member" is `m-1` (`src/config.ts`).

### Screens

- **Dashboard** (`app/index.tsx`) — greeting + tier badge, streak indicator, quick
  stat cards (visits / classes / favorite gym), next 3 upcoming bookings, and a
  **Check In** button that posts to the API with the member's home gym.
- **Class Booking** (`app/classes.tsx`) — classes grouped by date in a `SectionList`;
  each card shows name, instructor, time, capacity (`booked/capacity spots`) and a
  type badge. **Book** is disabled when full or already booked, with an inline
  success/error banner.

Navigation uses **Expo Router** file-based routing with a bottom `Tabs` layout
(`app/_layout.tsx`). Every screen has explicit loading / error / empty states.

---

## Architecture decisions & trade-offs

- **In-memory store as a module singleton** — the brief calls for an in-memory store
  with seed data. A single `store` instance keeps services simple; `createStore()` is
  exported so tests build isolated fixtures and the API suite can reseed between cases.
  Trade-off: no persistence and not safe for horizontal scaling — fine for the exercise.
- **Thin routes, logic in services** — routes only parse/validate input and delegate.
  Business rules (streak, booking validation, duplicate prevention) live in
  `services/` as pure functions, which makes them directly unit-testable without HTTP.
- **Typed domain errors** — a small `AppError` hierarchy (`NotFound`/`BadRequest`/
  `Conflict`) carries the HTTP status; one Fastify error handler maps everything to the
  consistent error envelope. Keeps status-code logic out of individual routes.
- **Validation via Fastify JSON schemas** — input validation lives at the route
  boundary using Fastify's built-in schema support (no extra dependency), with
  `additionalProperties: false` to reject unexpected fields. Fastify's own validation
  errors are normalized to the same `400` envelope.
- **Strict TypeScript, no `any`** — both projects run `strict` with `noImplicitAny`.
  Shared domain types are duplicated per project rather than shared through a workspace
  package, to keep the two deliverables independently runnable with `npm install`.
- **Expo Router + Tabs** — file-based routing is the SDK 58 default and gives the two
  screens a clean tabbed structure with almost no boilerplate.
- **Fetch-based API client** — a single typed `client.ts` wraps `fetch`, parses the
  error envelope into an `ApiError`, and exposes one method per endpoint, so screens
  never touch URLs or status codes directly.

## Testing

Eight+ tests across the required four categories:

| Category                | File                                            |
| ----------------------- | ----------------------------------------------- |
| Service function        | `backend/src/__tests__/streak.test.ts`          |
| API endpoint (`inject`) | `backend/src/__tests__/api.test.ts`             |
| Validation edge case    | `backend/src/__tests__/validation.test.ts`      |
| React component         | `mobile/src/__tests__/ClassCard.test.tsx`       |

```bash
cd backend && npm test
cd mobile  && npm test
```
