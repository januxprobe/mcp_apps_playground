# Tests

This directory contains **integration tests** and **shared test utilities** for the MCP Apps Playground.

## Test Organization

**Co-Located Tests (Primary):**
App-specific tests are located alongside the app code:

```
apps/
├── pdf-generator/
│   └── tests/                      # PDF generator tests
│       ├── server.test.ts
│       ├── pdf-utils.test.ts
│       └── widget-logic.test.ts
├── echo/
│   └── tests/                      # Echo app tests (ready for tests)
├── calculator/
│   └── tests/                      # Calculator app tests (ready for tests)
└── hospi-copilot/
    └── tests/                      # Hospi-copilot tests (ready for tests)
```

**Central Tests (This Directory):**
This directory is reserved for:
- Integration tests (cross-app testing)
- Shared test utilities
- Test fixtures and mock data
- Test examples and patterns

```
tests/
├── examples/           # Learning examples (runnable scripts)
│   ├── pdf-generation.ts
│   ├── pdf-base64.ts
│   └── pdf-utils.ts
├── fixtures/           # Test data and expected outputs
└── integration/        # Cross-app tests (future)
```

## Running Tests

**All tests:**
```bash
npm test                           # Run all tests
npm run test:watch                 # Watch mode
npm run test:ui                    # Vitest UI
npm run test:coverage              # Coverage report
```

**Per-app tests:**
```bash
npm run test:echo                  # Echo app tests only
npm run test:calculator            # Calculator app tests only
npm run test:hospi-copilot         # Hospi-copilot tests only
npm run test:pdf-generator         # PDF generator tests only
```

## Test Types

### App-Specific Tests

Located in `apps/{app-id}/tests/` - tests for individual apps.

**Writing app tests:**
```typescript
// apps/myapp/tests/server.test.ts
import { describe, it, expect } from 'vitest';

describe('MyApp Server', () => {
  it('should export required constants', async () => {
    const module = await import('../server.js');
    expect(module.APP_NAME).toBeDefined();
    expect(module.createServer).toBeDefined();
  });
});
```

### Examples (`tests/examples/`)

Learning and exploration scripts. These are NOT automated tests - they're runnable examples that demonstrate how to use features.

**Run examples:**
```bash
npx tsx tests/examples/pdf-generation.ts
npx tsx tests/examples/pdf-base64.ts
npx tsx tests/examples/pdf-utils.ts
```

**Purpose:**
- Learn how libraries work (e.g., pdfkit)
- Experiment with patterns
- Generate sample outputs for manual verification
- Quick prototyping

### Fixtures (`tests/fixtures/`)

Shared test data, sample inputs, and expected outputs.

**Examples:**
- Sample invoice data
- Mock API responses
- Expected PDF outputs (for comparison)
- Test images/assets

## Guidelines

### When to Use Unit Tests

- Testing utility functions
- Testing business logic
- Testing error handling
- Automated verification

### When to Use Examples

- Learning new libraries
- Prototyping new features
- Manual verification
- Documentation/demos

## Configuration

**Vitest config:** `vitest.config.ts` in project root

```typescript
{
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    testTimeout: 10000,
  }
}
```

## Coverage

Generate coverage reports:
```bash
npm run test:coverage
```

Coverage reports are saved to `coverage/` (gitignored).

## Best Practices

1. **Name test files:** `*.test.ts` for unit tests
2. **Name example files:** Descriptive names without `.test` suffix
3. **Keep tests focused:** One concept per test
4. **Use descriptive test names:** Test name should explain what it tests
5. **Organize with describe blocks:** Group related tests

## Adding New Tests

### For New Utilities

Create `tests/unit/<utility-name>.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { myUtility } from '../../infrastructure/server/utils/my-utility.js';

describe('My Utility', () => {
  it('should work correctly', () => {
    expect(myUtility('input')).toBe('expected');
  });
});
```

### For New Apps

Create `apps/{app-id}/tests/<test-name>.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
// Test app-specific functionality
```

### For Integration Tests

Create `tests/integration/<feature>.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
// Test cross-app scenarios
```

### For Learning Examples

Create `tests/examples/<feature-name>.ts`:

```typescript
// Runnable script that demonstrates the feature
console.log('Testing feature X...');
// ... demo code
```

## Debugging Tests

**Run specific test file:**
```bash
npm test pdf-utils
```

**Run in watch mode:**
```bash
npm run test:watch
```

**Use debugger:**
```typescript
it('should debug', () => {
  debugger;  // Will pause if running with --inspect
  expect(something).toBe(true);
});
```

**Verbose output:**
```bash
npm test -- --reporter=verbose
```

## Benefits of Co-Located Tests

✅ **Proximity:** Tests are next to the code they test
✅ **Discoverability:** Easy to find tests for a specific app
✅ **Isolation:** Can run tests for a single app independently
✅ **Consistency:** Matches app isolation architecture and docs structure
✅ **Self-Contained:** Each app has its code, tests, docs, and widget together
✅ **Scalability:** Adding new apps automatically adds test directories

## CI/CD Integration

Tests run automatically in CI:
- On pull requests
- Before merges
- On main branch pushes

**Required:** All tests must pass before merging.

---

*For more info, see `/docs/` for pattern guides.*
