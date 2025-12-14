Copyright (c) Santa Barbara Newcomers Club. All rights reserved.

# Help Widget (v1)

A small, context-aware widget that shows 4–5 preformatted help questions based on the user’s context. Clicking a question opens the chatbot widget with the question prefilled and a server-generated context bundle attached.

Goals:
- Help non-technical members and volunteers quickly.
- Provide guided questions that are safe and relevant.
- Integrate with the chatbot without becoming an admin command console.

Non-goals (v1):
- Replacing full documentation.
- Free-form privileged actions through chat.

## UX Behavior

Display:
- “Need help?” header
- 4–5 suggested questions
- Optional “More help” link (to a help page)

Click behavior:
- Opens chat panel (or navigates to /help/chat)
- Prefills selected question
- Attaches context (server-side) for grounding and RBAC-safe support

Examples:
- “What does this page do?”
- “Why can’t I see or edit this?”
- “What should I do next?”
- “How do I contact the right person?”

Rules:
- Suggestions are generated server-side.
- Do not render suggestions (or links) the actor cannot access.
- Do not rely on client-side hiding.

## Context Inputs (Server-Side)

Minimum:
- actor roles/groups
- pageSlug
- module context (events/membership/finance/etc.)
- error state (optional)
- relevant entity ids already in scope (optional)

## Suggestion Generation (v1)

Recommended approach:
- Deterministic rules table (safest), optionally with LLM phrasing later.

Examples:
- If pageSlug matches admin/events:
  - “How do I create an event?”
  - “How do I email registrants?”

- If anonymous:
  - “How do I join?”
  - “How do I log in?”

## Integration with Chatbot

Contract:
- Help widget can open the chatbot in guidance/read-only mode.
- Any privileged action must occur through explicit UI flows and permissions, not chat.

Payload to chatbot:
- prefilledQuestion
- context bundle (server-generated):
  - pageSlug
  - actorRoles
  - siteId
  - allowedModules
  - relevantEntityIds (optional)

## Persistence

Default:
- No per-instance persistence required.

Optional site-level config:
- enabled (bool)
- maxQuestions (default 5)
- customQuestionsByPagePattern (json)

Permissions:
- content:helpWidget:edit
- content:helpWidget:admin (Tech Chair)
