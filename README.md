# ReadyBy ⏱️

A reverse-countdown alarm app — enter the time you need to leave, add your morning tasks, and ReadyBy calculates exactly when you need to start each one.

> **Status: In active development** — core screens built, freemium model planned

---

## The Problem

Most alarm apps tell you when to wake up. ReadyBy works backwards from when you need to *leave*.

You set your departure time, add tasks with estimated durations (shower, coffee, pack bag), and the app builds a reverse timeline — showing the latest possible start time for each task so you make it out the door on time.

---

## Tech Stack

| Layer | Detail |
|---|---|
| Framework | React Native + Expo (file-based routing) |
| Language | TypeScript |
| Backend / DB | Supabase (PostgreSQL) |
| State | React hooks |
| Environment | Expo Go / iOS Simulator |

---

## Current State

Three screens built and working:

- **Arrival time input** — set your departure time with a time picker
- **Task list** — add tasks with name + duration estimate, reorder, delete
- **Result / timeline view** — reverse-calculated schedule showing start time per task

DB schema designed across 5 tables: `users`, `schedules`, `tasks`, `task_templates`, `settings`

---

## Planned Features

**Free tier**
- Unlimited schedules
- Manual task entry
- Reverse timeline calculation
- Basic alarm at first task start time

**Premium (planned)**
- Task templates (saved routines)
- Smart suggestions based on usage patterns
- Calendar integration
- Widget support

---

## Why I Built This

I wanted a project that required real mobile UI thinking — not just a web app wrapper. The reverse-countdown concept is simple enough to build solo but interesting enough to be genuinely useful. It's also a good fit for a freemium model, which I wanted hands-on experience designing from the start.

The Supabase schema was designed upfront before any screens were built — a deliberate choice to practice data modelling before writing UI code.

---

## Running Locally

```bash
npm install
npx expo start
```

Requires a Supabase project with the schema applied. Environment variables:
```
EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
```

---

*Part of a broader portfolio of analytics and automation work. See [data-sj.vercel.app](https://data-sj.vercel.app)*
