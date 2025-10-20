# Auth Template Documentation

This document provides a comprehensive guide to the features and usage of this Next.js authentication template.

## Project Overview

This template provides a robust starting point for building Next.js applications with a complete authentication system. It leverages the power of the Next.js App Router, Server Components, and a modern tech stack to deliver a secure and performant user experience.

## Features

*   **Authentication with `better-auth`:** A secure and flexible authentication library for Next.js.
*   **Email & Password:** Standard email and password authentication for user sign-up and sign-in.
*   **Role-Based Access Control (RBAC):** Easily restrict access to pages and API routes based on user roles.
*   **Protected Routes:** A clear and secure way to protect pages and API routes from unauthorized access.
*   **Prisma Integration:** A modern database toolkit for TypeScript and Node.js.
*   **Modern Tech Stack:** Built with the latest technologies, including Next.js App Router, Tailwind CSS, Radix UI, and TypeScript.

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up the database:**

    *   This template uses SQLite by default, so no database setup is required.
    *   To use a different database (e.g., PostgreSQL), update the `provider` in `prisma/schema.prisma` and the `DATABASE_URL` in `.env`.

4.  **Run the database migrations:**

    ```bash
    npx prisma migrate dev
    ```

5.  **Seed the database (optional):**

    ```bash
    npm run seed
    ```

6.  **Run the development server:**

    ```bash
    npm run dev
    ```

## Usage

### Sign-up and Sign-in

The sign-up and sign-in forms are located in `app/(auth)/sign-up` and `app/(auth)/sign-in` respectively. They use client-side components to handle user input and interact with the `better-auth` client.

**Example: Signing in a user**

```typescript
// app/(auth)/sign-in/client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SignIn from "@/components/auth/signin";
import { authClient } from "@/auth-kit/client";
import { toast } from "sonner";

// ...

async function handleSubmit(values: { email: string; password: string }) {
  setPending(true);
  const { error } = await authClient.signIn.email({
    email: values.email,
    password: values.password,
    callbackURL: initialNext,
    rememberMe: true,
  });
  setPending(false);

  if (error) {
    toast.error("Sign in failed", { description: error.message });
  } else {
    toast.success("Signed in!");
    router.push(initialNext);
  }
}
```

### Protecting Routes

You can protect pages and API routes by checking for a user's session on the server.

**Example: Protecting a page**

```typescript
// app/(protected)/dashboard/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionServer } from "@/auth-kit/server";

export default async function DashboardPage() {
  const session = await getSessionServer(headers);
  if (!session) {
    redirect("/sign-in");
    return null;
  }

  // ...
}
```

### Role-Based Access Control (RBAC)

You can use the `hasRole` function to restrict access to pages and API routes based on user roles.

**Example: Restricting access to an admin page**

```typescript
// app/(protected)/admin/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionServer } from "@/auth-kit/server";
import { hasRole } from "@/auth-kit/server/rbac";

export default async function AdminPage() {
  const session = await getSessionServer(headers);
  if (!session) {
    redirect("/sign-in");
    return null;
  }
  if (!hasRole(session, "ADMIN")) {
    redirect("/");
    return null;
  }

  // ...
}
```

### Session Management

**Server-side:**

Use the `getSessionServer` function to get the user's session in Server Components and Route Handlers.

```typescript
import { headers } from "next/headers";
import { getSessionServer } from "@/auth-kit/server";

const session = await getSessionServer(headers);
```

**Client-side:**

Use the `useSession` hook from `better-auth/react` to get the user's session in Client Components.

```typescript
"use client";

import { useSession } from "better-auth/react";

function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    return <p>Not signed in</p>;
  }

  return <p>Signed in as {session.user.email}</p>;
}
```

## Customization

### Adding New User Roles

1.  **Update the `AppRole` type in `auth-kit/server/config.ts`:**

    ```typescript
    export type AppRole = "ADMIN" | "USER" | "NEW_ROLE";
    ```

2.  **Update the `additionalFields` in `auth-kit/server/config.ts`:**

    ```typescript
    user: {
      additionalFields: {
        role: { type: "string", defaultValue: "USER", input: false },
        // ...
      },
    },
    ```

### Configuring `better-auth`

The main configuration for `better-auth` is in `auth-kit/server/config.ts`. Here you can configure:

*   Database adapter
*   User model
*   Session management
*   Email and password settings
*   And more...

### Changing the Database Provider

1.  **Update the `provider` in `prisma/schema.prisma`:**

    ```prisma
    datasource db {
      provider = "postgresql" // or "mysql"
      url      = env("DATABASE_URL")
    }
    ```

2.  **Update the `DATABASE_URL` in `.env`:**

    ```
    DATABASE_URL="postgresql://user:password@host:port/database"
    ```

3.  **Update the `provider` in `auth-kit/server/config.ts`:**

    ```typescript
    database: prismaAdapter(prisma, {
      provider: "postgresql", // or "mysql"
    }),
    ```
