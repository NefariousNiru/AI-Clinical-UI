# AI Clinical UI

A small, typed React + Vite admin/student UI for grading clinical submissions with LLMs.

## Quick start
1. Install: `pnpm i`
2. Env: create `.env` with  
   - local dev: `VITE_API_BASE_URL=http://localhost:8000`  
   - prod: `VITE_API_BASE_URL=https://insert_prod_url_here.com`
3. Run: `pnpm dev` (opens on http://localhost:5173)

## Architecture overview
- **Routing**: `react-router` with three entry routes  
  - `/` auto-redirects based on session  
  - `/login` public  
  - `/admin` admin-only  
  - `/student` student + admin
- **Auth**: Cookie-based session; `/api/v1/me` decides role.
- **Services**: `src/services/*` call a thin `http` wrapper and zod-validate results.
- **Types**: `src/types/*` define runtime-validated contracts (zod) and TS types via `z.infer`.
- **UI Primitives**: `src/components/ui/*` contains small, reusable primitives (Modal, Tabs).
- **Admin-only hooks (data orchestration)**: `src/routes/admin/hooks/*`  
  - `useSystemPrompt` – load/edit the system prompt  
  - `useSubmissions` – paginated submissions  
  - `useModels` – available model list + current selection  
  - `useRubrics` – rubric ids and on-demand rubric detail
- **Admin features**:
  - Load and edit the system prompt
  - List/paginate student submissions
  - Send a submission + prompt + model to the grader (`/admin/chat`)
  - View structured feedback
  - Save “Prompt + Submission + Model + Output” locally for later review
  - View rubric (formatted + JSON)

## Data flow - “Grade a submission”
1. User selects a submission in the right sidebar.
2. User edits/uses the System Prompt; selects a model.
3. User clicks **Send**.
4. `Dashboard` calls `services/adminApi.chat` with `{ studentSubmission, systemPrompt, modelName }`.
5. Response is zod-validated as `ProblemFeedbackList` and rendered in `OutputPanel -> ProblemFeedbackView`.
6. Optionally, user clicks **Save local** to write a JSON snapshot to `localStorage`.

**Where the data comes from now (hooks):**
- Prompt: `useSystemPrompt()`
- Submissions: `useSubmissions()`
- Models: `useModels()`
- Rubrics: `useRubrics()` (ids on mount, detail on demand)

## Data flow - “View a rubric”
1. `useRubrics()` loads rubric ids on mount.
2. Selecting a rubric triggers `fetchOne(rubricId)` to get `RubricPayload`.
3. `RubricViewer` displays either a formatted tree or raw JSON; tabs toggle the view.

## Development practices
- **Validation at the edge**: Service responses are parsed with zod so routes never handle `unknown`.
- **Single HTTP client**: `src/lib/http.ts` sets base URL, credentials, CSRF header, and normalizes errors.
- **Centralized errors**: `src/lib/errors.ts` converts thrown errors into readable messages for UIs.
- **Constants**: `src/lib/urls.ts` holds all API paths; do not inline strings in components.
- **Small UI primitives**: Reuse `Modal` and `Tabs` to keep presentation consistent and avoid duplication.
- **State ownership with hooks**: Admin route logic is split into `src/routes/admin/hooks/*` so `Dashboard` stays declarative.
- **Local history**: `src/lib/localSession.ts` stores session snapshots; emits a custom event so drawers refresh.
- **Styling**: Tailwind utilities; avoid bespoke components when a primitive will do.
- **Naming**: Default export components named after their file for predictable imports.

## Project layout
```

.
├── eslint.config.js
├── index.html
├── package.json
├── pnpm-lock.yaml
├── public
│   └── favicon.png
├── README.md
├── src
│   ├── App.css
│   ├── App.tsx
│   ├── assets
│   ├── components
│   │   ├── Header.tsx
│   │   └── ui
│   │       ├── Modal.tsx
│   │       └── Tabs.tsx
│   ├── index.css
│   ├── lib
│   │   ├── errors.ts
│   │   ├── functions.ts
│   │   ├── http.ts
│   │   ├── localSession.ts
│   │   └── urls.ts
│   ├── main.tsx
│   ├── routes
│   │   ├── admin
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── hooks
│   │   │   │   ├── useModels.ts
│   │   │   │   ├── useRubrics.ts
│   │   │   │   ├── useSubmissions.ts
│   │   │   │   └── useSystemPrompt.ts
│   │   │   ├── JsonBlock.tsx
│   │   │   ├── OutputPanel.tsx
│   │   │   ├── ProblemFeedbackView.tsx
│   │   │   ├── PromptEditor.tsx
│   │   │   ├── RubricFormatted.tsx
│   │   │   ├── RubricViewer.tsx
│   │   │   ├── ScaffoldDrawer.tsx
│   │   │   ├── SubmissionList.tsx
│   │   │   └── SubmissionViewer.tsx
│   │   ├── auth
│   │   │   ├── AutoHome.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── RequireAuth.tsx
│   │   └── student
│   │       ├── StudentHome.tsx
│   │       └── StudentLayout.tsx
│   ├── services
│   │   ├── adminApi.ts
│   │   └── authApi.ts
│   ├── types
│   │   ├── admin.ts
│   │   ├── auth.ts
│   │   └── rubric.ts
│   └── vite-env.d.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts

```

## Environment
- `VITE_API_BASE_URL` must start with `http://` or `https://`. The app hard-fails early if missing or invalid.

## Accessibility
- Modals support ESC-to-close and backdrop-click close.
- Buttons and controls have clear focus styles and aria labels where applicable.

## Testing notes
- Validate service responses by mocking `http` and asserting zod parse paths.
- For UI, render `Modal` and `Tabs` in isolation to ensure keyboard and mouse interactions behave.
- Hooks can be unit-tested by mocking `services/adminApi` and asserting state transitions.
