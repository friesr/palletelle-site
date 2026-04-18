# Development Setup

## 1. Objective

Define a reproducible local development workflow for Atelier without depending on global machine-specific state inside repo scripts.

## 2. What is known

- The repository uses `pnpm` workspaces.
- Some environments may not allow `corepack enable` to write global symlinks.
- The repo should remain reproducible for new developers and agents.

## 3. What is inferred

- The cleanest repo state is to keep standard `pnpm` scripts in `package.json`.
- Environment-specific workarounds should be documented, not embedded into the repository itself.

## 4. What is uncertain

- Whether every future environment will allow standard corepack activation.

## 5. Risks

- If setup steps are under-documented, fresh environments may fail before work begins.
- If repo scripts encode local path hacks, the repo becomes harder to trust and share.

## 6. Proposed action

Use the setup workflow below.

## 7. Whether approval is required

No, for documentation.

## 8. Next step

Use this document as the local setup reference.

---

## Preferred setup

### Prerequisites
- Node.js 22 or compatible
- `corepack` available

### Standard setup

1. Prepare pnpm through corepack:

```bash
corepack prepare pnpm@9.15.0 --activate
```

2. Verify pnpm:

```bash
pnpm --version
```

3. Install dependencies:

```bash
pnpm install
```

4. Run tests:

```bash
pnpm test
```

5. Run the storefront locally:

```bash
pnpm dev
```

6. Build the storefront:

```bash
pnpm build
```

## Fallback for locked-down environments

If `corepack enable` or global pnpm shims are blocked, do not modify repo scripts.
Use the prepared pnpm binary directly for that session.

Example:

```bash
corepack prepare pnpm@9.15.0 --activate
node ~/.cache/node/corepack/v1/pnpm/9.15.0/dist/pnpm.cjs install
node ~/.cache/node/corepack/v1/pnpm/9.15.0/dist/pnpm.cjs test
node ~/.cache/node/corepack/v1/pnpm/9.15.0/dist/pnpm.cjs --filter storefront build
```

Note:
- the exact cache path may vary by environment
- this is a fallback operational technique, not the repo contract

## Workspace commands

- `pnpm dev` → run storefront dev server
- `pnpm test` → run all workspace tests
- `pnpm build` → build storefront
- `pnpm --filter storefront start` → run built storefront locally

## Reproducibility notes

- keep `packageManager` pinned in `package.json`
- do not commit secrets
- do not encode machine-local executable paths in repository scripts
- document environment exceptions instead of normalizing around them in code
