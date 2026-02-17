# Burnout Guard HIG Foundation

## 1. Assumptions and Platform Scope

- Platform: responsive web dashboard inspired by iOS/iPadOS HIG patterns.
- Product type: personal productivity and workload health tracker.
- Core jobs:
  - capture tasks fast
  - keep one clear active focus
  - detect overload signals early
- Accessibility baseline:
  - keyboard access
  - readable contrast
  - semantic labels for controls
- Localization scope: first version assumes Korean and English copy support.

## 2. IA and Navigation Model

- Single-screen dashboard first, then scale to:
  - `Today`
  - `History`
  - `Insights`
- Current IA follows HIG deference principles:
  - Primary action (`Save Task`) stays visible in top content area.
  - Summary signal (`Burnout Risk`) is adjacent to creation flow.
  - Work content (`Task Board`) is grouped by status for rapid scanning.

## 3. Visual and Component System Decisions

- Component base: shadcn-style primitives (`Button`, `Card`, `Input`, `Badge`).
- Styling: Tailwind utilities only.
- Token direction:
  - soft surface backgrounds for reduced visual fatigue
  - single accent blue for primary actions
  - semantic risk colors for warning/destructive states
- Typography:
  - compact hierarchy
  - stronger weights for action and status labels

## 4. Interaction and State Behavior

- Task creation:
  - disabled submit for insufficient title length
  - immediate insertion to `To Do` section
- Task progression:
  - explicit `To Do`, `Doing`, `Done` transitions
- Burnout summary:
  - recomputed after every task/status change
- Edge states included:
  - empty (`No tasks yet`)
  - loading (`Loading tasks`)
  - error (`Could not load tasks`)
  - offline (`Offline mode`)

## 5. Accessibility and Localization Checks

- Inputs and status controls expose explicit labels.
- Focus rings are visible and color-consistent.
- Button hit areas use at least 36px height, targeting comfortable interaction.
- Body copy avoids overly condensed line lengths.
- String literals are centralized as candidates for i18n extraction in next step.

## 6. Handoff Details and Acceptance Criteria

- Buildable files:
  - `src/pages/dashboard/ui/dashboard-page.tsx`
  - `src/widgets/task-board/ui/task-board.tsx`
  - `src/widgets/burnout-summary/ui/burnout-summary.tsx`
  - `src/features/task/create-task/ui/create-task-form.tsx`
  - `src/shared/ui/*`
- Acceptance criteria:
  - user can add a task and see it in board
  - user can change task status across three stages
  - burnout risk level updates on interactions
  - empty/loading/error/offline states are explicitly rendered
  - keyboard focus is visible on interactive controls
