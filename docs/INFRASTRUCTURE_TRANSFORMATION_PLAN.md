# Plan: Transform MCP Apps Playground into Production-Ready Infrastructure Monorepo

## Context

**Current Situation:**
The MCP Apps Playground is a learning/experimental tool with 6 working apps (echo, calculator, hospi-copilot, pdf-generator, file-processor, dashboard) and ~787 lines of reusable infrastructure code. Apps are self-contained and import infrastructure via relative paths (`../../infrastructure/`).

**User Request:**
Transform this into a production-ready infrastructure monorepo that can:
1. **Support production apps outside the playground** - External projects use this as their foundation
2. **Be a central infrastructure repo** - With reusable templates, components, and utilities
3. **Have systematic infrastructure extraction** - Process to detect when app code should move to shared infrastructure
4. **Use Claude skills as assistant** - Help with infrastructure management and pattern detection

**Why This Matters:**
- **Reusability**: Currently, every new project must manually copy infrastructure files
- **Maintainability**: Infrastructure updates can't be rolled out to existing apps
- **Best practices**: Proven patterns from playground apps should be available to all projects
- **Developer experience**: Simple `npm install @mcp-apps/infrastructure` vs manual file copying

**Desired Outcome:**
A monorepo where:
- Infrastructure is a published npm package (`@mcp-apps/infrastructure`)
- Playground apps use infrastructure as a workspace dependency
- External projects can consume infrastructure via npm
- Systematic process exists to identify and extract reusable patterns
- Claude skills assist with detection and extraction

---

## Implementation Strategy: 6 Phases

### Phase 1: Monorepo Structure (Week 1-2)

**Goal:** Restructure repository as npm workspaces monorepo with infrastructure as separate package.

**New Directory Structure:**
```
mcp-apps-playground/
├── packages/
│   └── infrastructure/              # NEW: Publishable package
│       ├── package.json
│       ├── src/
│       │   ├── server/
│       │   │   ├── main.ts         # HTTP/STDIO transports
│       │   │   ├── types.ts        # Core interfaces
│       │   │   └── utils/
│       │   │       ├── i18n.ts
│       │   │       ├── csp.ts
│       │   │       ├── pdf-utils.ts
│       │   │       └── file-handling.ts
│       │   └── index.ts            # Public API
│       ├── dist/                   # Build output
│       ├── README.md
│       ├── CHANGELOG.md
│       └── tsconfig.json
├── apps/                           # Internal playground apps (unchanged structure)
│   ├── echo/
│   ├── calculator/
│   ├── hospi-copilot/
│   ├── pdf-generator/
│   ├── file-processor/
│   └── dashboard/
├── scripts/                        # Monorepo automation
└── package.json                    # Root workspace config
```

**Actions:**

**1.1 Create Infrastructure Package**
```bash
mkdir -p packages/infrastructure/src/server/utils
```

**1.2 Move Infrastructure Files**
```bash
# Move server code
mv infrastructure/server/main.ts packages/infrastructure/src/server/
mv infrastructure/server/types.ts packages/infrastructure/src/server/
mv infrastructure/server/utils/* packages/infrastructure/src/server/utils/
```

**1.3 Create Infrastructure package.json**
```json
{
  "name": "@mcp-apps/infrastructure",
  "version": "1.0.0",
  "description": "Core infrastructure for building MCP Apps",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./server": "./dist/server/main.js",
    "./types": "./dist/server/types.js",
    "./utils/i18n": "./dist/server/utils/i18n.js",
    "./utils/csp": "./dist/server/utils/csp.js",
    "./utils/pdf": "./dist/server/utils/pdf-utils.js",
    "./utils/files": "./dist/server/utils/file-handling.js"
  },
  "files": ["dist", "README.md", "CHANGELOG.md"],
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "clean": "rm -rf dist"
  },
  "peerDependencies": {
    "@modelcontextprotocol/ext-apps": "^1.0.1",
    "@modelcontextprotocol/sdk": "^1.26.0",
    "express": "^5.0.0",
    "cors": "^2.8.0",
    "zod": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "@types/node": "^25.0.0",
    "@types/express": "^5.0.0",
    "@types/cors": "^2.8.0"
  }
}
```

**1.4 Create Infrastructure Public API**

`packages/infrastructure/src/index.ts`:
```typescript
// Core server exports
export * from './server/main.js';
export * from './server/types.js';

// Utility exports
export * from './server/utils/i18n.js';
export * from './server/utils/csp.js';
export * from './server/utils/pdf-utils.js';
export * from './server/utils/file-handling.js';
```

**1.5 Create Infrastructure tsconfig.json**
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

**1.6 Update Root package.json for Workspaces**
```json
{
  "name": "mcp-apps-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "build": "npm run build:infrastructure && npm run build:apps",
    "build:infrastructure": "npm run build -w @mcp-apps/infrastructure",
    "build:apps": "npm run build:echo && npm run build:calculator && npm run build:hospi-copilot && npm run build:pdf-generator && npm run build:file-processor && npm run build:dashboard",
    "build:echo": "npm run build -w @mcp-apps-playground/echo",
    "build:calculator": "npm run build -w @mcp-apps-playground/calculator",
    "build:hospi-copilot": "npm run build -w @mcp-apps-playground/hospi-copilot",
    "build:pdf-generator": "npm run build -w @mcp-apps-playground/pdf-generator",
    "build:file-processor": "npm run build -w @mcp-apps-playground/file-processor",
    "build:dashboard": "npm run build -w @mcp-apps-playground/dashboard",
    "test": "npm run test --workspaces",
    "clean": "npm run clean --workspaces"
  },
  "devDependencies": {
    "@modelcontextprotocol/inspector": "^0.20.0",
    "@vitest/ui": "^4.0.18",
    "cross-env": "^10.1.0",
    "typescript": "^5.9.3",
    "vitest": "^4.0.18"
  }
}
```

**Testing Phase 1:**
```bash
npm install  # Workspace install
npm run build:infrastructure  # Should succeed
ls packages/infrastructure/dist  # Verify build output exists
```

---

### Phase 2: Migrate Apps to Use Infrastructure Package (Week 2-3)

**Goal:** Update all playground apps to import from `@mcp-apps/infrastructure` instead of relative paths.

**2.1 Create Per-App package.json**

For each app (echo, calculator, hospi-copilot, pdf-generator, file-processor, dashboard):

`apps/echo/package.json`:
```json
{
  "name": "@mcp-apps-playground/echo",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "Echo app - text echo with character/word counts",
  "dependencies": {
    "@mcp-apps/infrastructure": "workspace:*",
    "@modelcontextprotocol/ext-apps": "^1.0.1",
    "@modelcontextprotocol/sdk": "^1.26.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "vite": "^7.3.1",
    "vite-plugin-singlefile": "^2.3.0",
    "tsx": "^4.21.0",
    "@types/node": "^25.2.3",
    "concurrently": "^9.2.1"
  },
  "scripts": {
    "build": "npm run build:server && npm run build:widget",
    "build:server": "tsc -p tsconfig.json",
    "build:widget": "vite build",
    "dev": "concurrently 'vite build --watch' 'tsx watch standalone.ts'",
    "start": "tsx standalone.ts",
    "start:stdio": "tsx standalone.ts --stdio"
  }
}
```

Repeat for all apps (adjust dependencies per app - pdf-generator needs pdfkit, etc.)

**2.2 Update App Imports**

Find and replace in all app files:

**Before:**
```typescript
import { startStreamableHTTPServer, startStdioServer } from "../../infrastructure/server/main.js";
import type { AppServerModule } from "../../infrastructure/server/types.js";
import { createResourceMeta, SELF_CONTAINED_CSP } from "../../infrastructure/server/csp.js";
```

**After:**
```typescript
import { startStreamableHTTPServer, startStdioServer } from "@mcp-apps/infrastructure/server";
import type { AppServerModule } from "@mcp-apps/infrastructure/types";
import { createResourceMeta, SELF_CONTAINED_CSP } from "@mcp-apps/infrastructure/utils/csp";
```

**Files to Update per App:**
- `server.ts` - Infrastructure imports
- `standalone.ts` - Transport imports

**2.3 Update App TypeScript Configs**

`apps/echo/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/echo/server"
  },
  "references": [
    { "path": "../../packages/infrastructure" }
  ],
  "include": ["*.ts"],
  "exclude": ["widget"]
}
```

**2.4 Migration Order (One App at a Time)**

1. **Echo** (simplest, pilot app)
2. **Calculator** (validation)
3. **Hospi-copilot** (complex)
4. **PDF Generator** (has extra deps)
5. **File Processor**
6. **Dashboard**

**Testing Per App:**
```bash
npm run build:echo
./scripts/start-app.sh echo
# Test in ChatGPT
npm run inspector:echo
# Test with Inspector
```

---

### Phase 3: Infrastructure Detection & Extraction Process (Week 3-4)

**Goal:** Create systematic process to identify code that should move to infrastructure.

**3.1 Detection Patterns**

**What Makes Code "Infrastructure"?**
- ✅ **Duplication** - Same code in 3+ apps
- ✅ **Generic** - No app-specific business logic
- ✅ **Platform concern** - Transport, validation, security, formatting
- ✅ **Common pattern** - Date handling, state machines, file validation

**What Stays in Apps?**
- ❌ **Business logic** - Hospital lists, insurance rules
- ❌ **App-specific UI** - Custom widgets
- ❌ **Single-use code** - Only used in one app

**3.2 Create Detection Script**

`scripts/detect-extractable-patterns.sh`:
```bash
#!/bin/bash
# Detects duplicate code and extractable patterns across apps

echo "🔍 Infrastructure Pattern Detection"
echo "=================================="

# 1. Find duplicate function signatures
echo ""
echo "📊 Duplicate Functions Across Apps:"
echo "-----------------------------------"
for app in apps/*/; do
  app_name=$(basename "$app")
  [[ "$app_name" == "_template" ]] && continue

  # Extract function names
  grep -h "^function \|^export function \|^const .* = (" "$app"*.ts 2>/dev/null | \
    sed 's/^export //' | \
    sed 's/function //' | \
    sed 's/const //' | \
    sed 's/ =.*//' | \
    sort | uniq -d
done | sort | uniq -c | sort -rn

# 2. Find common imports/patterns
echo ""
echo "🔄 Common Imports (Potential Shared Utils):"
echo "-------------------------------------------"
grep -h "^import " apps/*/server.ts apps/*/widget/*.ts 2>/dev/null | \
  sort | uniq -c | sort -rn | head -20

# 3. Detect repeated constants
echo ""
echo "📌 Repeated Constants:"
echo "---------------------"
grep -h "^const " apps/*/server.ts 2>/dev/null | \
  sed 's/=.*//' | sort | uniq -c | sort -rn | head -10

echo ""
echo "✅ Detection complete. Review candidates manually."
```

**3.3 Extraction Process Workflow**

**Step-by-Step:**

1. **Run Detection Monthly**
   ```bash
   ./scripts/detect-extractable-patterns.sh > detection-report.txt
   ```

2. **Manual Review** - Evaluate candidates:
   - Is it truly generic?
   - Used by 2+ apps (or will be soon)?
   - No app-specific logic?

3. **Create Extraction PR**
   - Copy code to `packages/infrastructure/src/server/utils/[name].ts`
   - Write tests
   - Update apps to use new utility
   - Document in CHANGELOG.md

4. **Version Bump**
   - Minor version bump (1.1.0 → 1.2.0) for new utilities
   - Apps update to new version

**3.4 Extraction Candidates (From Current Apps)**

Based on exploration, here are immediate candidates:

| Pattern | Location | Apps | Priority | Action |
|---------|----------|------|----------|--------|
| State machine pattern | hospi-copilot widget | 1 | Medium | Wait for 2nd use case |
| PDF rendering widget | pdf-generator widget | 1 | Medium | Wait for 2nd use case |
| File upload UI | file-processor widget | 1 | Low | App-specific currently |
| Date validation | hospi-copilot | 1 | Low | Generic but single use |

**Note:** Current apps don't have enough duplication yet. Detection process will identify patterns as more apps are built.

---

### Phase 4: Skills Integration (Week 4-5)

**Goal:** Create Claude skills to assist with infrastructure detection and extraction.

**4.1 Detection Skill**

`scripts/skills/detect.sh`:
```bash
#!/bin/bash
# Claude Skill: /infra-detect
# Analyzes apps for extractable patterns

./scripts/detect-extractable-patterns.sh

# Generate summary
echo ""
echo "💡 Recommendations:"
echo "==================="
echo "1. Review duplicates with 3+ occurrences"
echo "2. Check if patterns are truly generic"
echo "3. Create extraction PR for approved patterns"
```

**4.2 Audit Skill**

`scripts/skills/audit.sh`:
```bash
#!/bin/bash
# Claude Skill: /infra-audit
# Audits infrastructure health

echo "🏥 Infrastructure Health Audit"
echo "=============================="

# Check infrastructure version across apps
echo ""
echo "📦 Infrastructure Versions:"
for app in apps/*/package.json; do
  [[ "$app" == "apps/_template/package.json" ]] && continue
  app_name=$(basename $(dirname "$app"))
  version=$(jq -r '.dependencies["@mcp-apps/infrastructure"]' "$app")
  echo "  $app_name: $version"
done

# Check for relative imports (should be none after migration)
echo ""
echo "⚠️  Relative Infrastructure Imports (should be 0):"
grep -r "from \".*infrastructure/" apps/*/server.ts apps/*/standalone.ts 2>/dev/null | wc -l

# Check for unused utilities
echo ""
echo "📊 Infrastructure Utility Usage:"
grep -rh "from '@mcp-apps/infrastructure" apps/ 2>/dev/null | \
  sed "s/.*from '@mcp-apps\/infrastructure\///" | \
  sed "s/'.*//" | \
  sort | uniq -c | sort -rn

echo ""
echo "✅ Audit complete"
```

**4.3 Extract Skill (Template)**

`scripts/skills/extract.sh`:
```bash
#!/bin/bash
# Claude Skill: /infra-extract
# Semi-automated extraction workflow

PATTERN_NAME=$1

if [[ -z "$PATTERN_NAME" ]]; then
  echo "Usage: ./scripts/skills/extract.sh <pattern-name>"
  exit 1
fi

echo "🔧 Extracting pattern: $PATTERN_NAME"
echo "===================================="

# Create utility file
UTIL_FILE="packages/infrastructure/src/server/utils/${PATTERN_NAME}.ts"
echo "Creating $UTIL_FILE..."
touch "$UTIL_FILE"

# Create test file
TEST_FILE="packages/infrastructure/tests/utils/${PATTERN_NAME}.test.ts"
echo "Creating $TEST_FILE..."
touch "$TEST_FILE"

echo ""
echo "✅ Files created. Next steps:"
echo "1. Implement utility in $UTIL_FILE"
echo "2. Write tests in $TEST_FILE"
echo "3. Export from packages/infrastructure/src/index.ts"
echo "4. Update apps to use new utility"
echo "5. Run tests: npm run test -w @mcp-apps/infrastructure"
echo "6. Update CHANGELOG.md"
```

**4.4 Skills Documentation**

Add to README.md:
```markdown
## Infrastructure Management Skills

### Detection
```bash
./scripts/skills/detect.sh
```
Analyzes apps for extractable patterns

### Audit
```bash
./scripts/skills/audit.sh
```
Health check: versions, imports, usage

### Extract
```bash
./scripts/skills/extract.sh <pattern-name>
```
Create new infrastructure utility
```

---

### Phase 5: External Consumption (Week 5-6)

**Goal:** Enable external projects to consume infrastructure via npm.

**5.1 Publish Infrastructure Package**

**Initial: Private npm Registry (Optional)**
```bash
cd packages/infrastructure
npm version 1.0.0
npm publish --registry=https://your-private-registry.com
```

**Later: Public npm Registry**
```bash
cd packages/infrastructure
npm version 1.0.0
npm publish --access public
```

**5.2 External Project Template**

`packages/infrastructure/README.md`:
```markdown
# @mcp-apps/infrastructure

Core infrastructure for building MCP Apps that work on ChatGPT and Claude Desktop.

## Installation

```bash
npm install @mcp-apps/infrastructure
```

## Quick Start

```typescript
// server.ts
import { startStreamableHTTPServer } from '@mcp-apps/infrastructure/server';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function createServer(): McpServer {
  const server = new McpServer({
    name: "My App",
    version: "1.0.0"
  });

  // Register your tools...

  return server;
}

// standalone.ts
import { startStreamableHTTPServer, startStdioServer } from '@mcp-apps/infrastructure/server';
import { createServer } from './server.js';

async function main() {
  if (process.argv.includes("--stdio")) {
    await startStdioServer(createServer);
  } else {
    await startStreamableHTTPServer(createServer);
  }
}

main();
```

## API Documentation

### Server
- `startStreamableHTTPServer(createServer)` - HTTP transport for ChatGPT
- `startStdioServer(createServer)` - STDIO transport for Claude Desktop

### Utilities
- `i18n` - Internationalization helpers
- `csp` - Content Security Policy configuration
- `pdf-utils` - PDF generation utilities
- `file-handling` - File validation and processing

See [full documentation](./docs/API.md)
```

**5.3 External Project Example**

Create example external project in `examples/external-app/`:
```
examples/
└── external-app/
    ├── package.json
    ├── server.ts
    ├── standalone.ts
    └── README.md
```

`examples/external-app/package.json`:
```json
{
  "name": "my-weather-app",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@mcp-apps/infrastructure": "^1.0.0",
    "@modelcontextprotocol/ext-apps": "^1.0.1",
    "@modelcontextprotocol/sdk": "^1.26.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "tsx": "^4.21.0"
  },
  "scripts": {
    "start": "tsx standalone.ts"
  }
}
```

**5.4 Versioning & Changelog**

`packages/infrastructure/CHANGELOG.md`:
```markdown
# Changelog

All notable changes to @mcp-apps/infrastructure will be documented here.

## [1.0.0] - 2026-XX-XX

### Added
- Initial release
- HTTP and STDIO transport support
- i18n utilities
- CSP configuration helpers
- PDF generation utilities
- File handling utilities

### Breaking Changes
None (initial release)

## Guidelines

- **Major (2.0.0)**: Breaking API changes
- **Minor (1.1.0)**: New features (backward compatible)
- **Patch (1.0.1)**: Bug fixes
```

---

### Phase 6: Documentation & Best Practices (Week 6)

**Goal:** Comprehensive documentation for internal and external users.

**6.1 Update Root README.md**

```markdown
# MCP Apps Infrastructure Monorepo

A production-ready monorepo for building MCP Apps that work on ChatGPT and Claude Desktop.

## 📦 Packages

### @mcp-apps/infrastructure
Core infrastructure library - [README](./packages/infrastructure/README.md)

```bash
npm install @mcp-apps/infrastructure
```

## 🎯 Playground Apps

6 working example apps demonstrating infrastructure usage:
- **Echo** - Simple text echo
- **Calculator** - Arithmetic operations
- **Hospi-Copilot** - Multi-step journey with i18n
- **PDF Generator** - Server-side PDF generation
- **File Processor** - File upload and processing
- **Dashboard** - Real-time system metrics

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build infrastructure + all apps
npm run build

# Start specific app
./scripts/start-app.sh echo
```

## 🔍 Infrastructure Management

### Detect Extractable Patterns
```bash
./scripts/skills/detect.sh
```

### Audit Infrastructure Health
```bash
./scripts/skills/audit.sh
```

### Extract New Pattern
```bash
./scripts/skills/extract.sh <pattern-name>
```

## 📚 Documentation

- [Infrastructure API](./packages/infrastructure/README.md)
- [App Development Guide](./docs/APP_DEVELOPMENT.md)
- [Infrastructure Extraction Guide](./docs/EXTRACTION_GUIDE.md)
- [External Project Setup](./examples/external-app/README.md)
```

**6.2 Create Extraction Guide**

`docs/EXTRACTION_GUIDE.md`:
```markdown
# Infrastructure Extraction Guide

When to extract code to infrastructure and how to do it.

## Decision Criteria

Extract when:
- ✅ Code is duplicated in 3+ apps
- ✅ Pattern is truly generic (no app-specific logic)
- ✅ Code handles platform concerns (transport, validation, security)
- ✅ Common utility (date formatting, file validation, etc.)

Keep in apps when:
- ❌ Business logic specific to one app
- ❌ Only used in one place
- ❌ Experimental or unstable code

## Process

1. **Detect**: Run `./scripts/skills/detect.sh`
2. **Review**: Evaluate candidates manually
3. **Extract**: Create utility in `packages/infrastructure/src/server/utils/`
4. **Test**: Write tests in `packages/infrastructure/tests/`
5. **Migrate**: Update apps to use new utility
6. **Document**: Update CHANGELOG.md

## Example: Extracting Date Validation

[Step-by-step example with code]
```

---

## Critical Files

### New Files to Create

1. **packages/infrastructure/package.json** - Infrastructure package definition
2. **packages/infrastructure/src/index.ts** - Public API exports
3. **packages/infrastructure/tsconfig.json** - Infrastructure build config
4. **packages/infrastructure/README.md** - External usage documentation
5. **packages/infrastructure/CHANGELOG.md** - Version history
6. **apps/echo/package.json** - Example per-app package.json (repeat for all apps)
7. **scripts/detect-extractable-patterns.sh** - Pattern detection
8. **scripts/skills/detect.sh** - Detection skill
9. **scripts/skills/audit.sh** - Audit skill
10. **scripts/skills/extract.sh** - Extraction skill template
11. **docs/EXTRACTION_GUIDE.md** - Infrastructure extraction documentation
12. **examples/external-app/** - External project example

### Files to Modify

13. **package.json** (root) - Workspace configuration
14. **apps/*/server.ts** - Update imports to use `@mcp-apps/infrastructure`
15. **apps/*/standalone.ts** - Update imports
16. **apps/*/tsconfig.json** - Add project references
17. **README.md** (root) - Document new structure
18. **CLAUDE.md** - Update development workflows

---

## Verification

### Phase 1 Verification (Monorepo Structure)
```bash
# Infrastructure builds independently
npm run build:infrastructure
test -d packages/infrastructure/dist && echo "✅ Infrastructure built"

# Workspace install works
npm install
npm ls @mcp-apps/infrastructure && echo "✅ Infrastructure available"
```

### Phase 2 Verification (App Migration)
```bash
# Apps import from package (not relative paths)
grep -r "from '@mcp-apps/infrastructure" apps/*/server.ts | wc -l  # Should be 6+
grep -r "from \".*\/.*\/infrastructure" apps/*/server.ts | wc -l  # Should be 0

# All apps build
npm run build:apps
ls dist/echo dist/calculator dist/hospi-copilot dist/pdf-generator dist/file-processor dist/dashboard

# Apps work in ChatGPT
./scripts/start-app.sh echo
# Test manually

# Apps work with Inspector
npm run inspector:echo
```

### Phase 3 Verification (Detection)
```bash
# Detection script runs
./scripts/skills/detect.sh
# Should produce output without errors

# Script identifies patterns (may be zero initially)
./scripts/skills/detect.sh | grep -c "function\|const"
```

### Phase 4 Verification (Skills)
```bash
# All skills run without errors
./scripts/skills/detect.sh
./scripts/skills/audit.sh
./scripts/skills/extract.sh test-pattern
# Verify files created
```

### Phase 5 Verification (External Consumption)
```bash
# Infrastructure publishes successfully
cd packages/infrastructure
npm publish --dry-run  # Test publish

# External example works
cd examples/external-app
npm install
npm run start
```

### Phase 6 Verification (Documentation)
```bash
# All documentation files exist
test -f packages/infrastructure/README.md
test -f docs/EXTRACTION_GUIDE.md
test -f examples/external-app/README.md
echo "✅ Documentation complete"
```

---

## Success Criteria

### Must Have (P0)
- ✅ Infrastructure builds as independent package
- ✅ All 6 apps import from `@mcp-apps/infrastructure` (no relative imports)
- ✅ All apps work in ChatGPT and Claude Desktop
- ✅ Detection script identifies patterns
- ✅ External example project works
- ✅ Documentation complete

### Should Have (P1)
- ✅ Skills run without errors
- ✅ CHANGELOG.md maintained
- ✅ Infrastructure published to npm (even if private)
- ✅ Test coverage >80% for infrastructure

### Nice to Have (P2)
- ⬜ Automated detection in CI/CD
- ⬜ Interactive extraction wizard
- ⬜ More external examples

---

## Risks & Mitigation

### Risk 1: Apps break during migration

**Mitigation:**
- Migrate one app at a time
- Run full tests after each migration
- Keep git commits small for easy rollback

### Risk 2: Infrastructure becomes too opinionated

**Mitigation:**
- Only extract patterns used by 2+ apps
- Start conservative, expand based on demand
- Document "when NOT to use infrastructure"

### Risk 3: External projects can't upgrade infrastructure

**Mitigation:**
- Strict semantic versioning
- Long deprecation windows (6+ months)
- Migration guides in CHANGELOG.md
- Maintain backward compatibility in core

### Risk 4: Detection produces false positives

**Mitigation:**
- Manual review required for all extractions
- Conservative thresholds
- Improve detection over time

---

## Timeline

- **Week 1-2**: Phase 1 (Monorepo structure)
- **Week 2-3**: Phase 2 (App migration)
- **Week 3-4**: Phase 3 (Detection process)
- **Week 4-5**: Phase 4 (Skills)
- **Week 5-6**: Phase 5 (External consumption)
- **Week 6**: Phase 6 (Documentation)

**Total: 6 weeks**

Can be done incrementally with working state after each phase.
