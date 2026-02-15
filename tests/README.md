# Tests

This directory contains all tests for the MCP Apps Playground.

## Structure

```
tests/
├── unit/               # Unit tests (with vitest)
│   └── pdf-utils.test.ts
├── examples/           # Learning examples (runnable scripts)
│   ├── pdf-generation.ts
│   ├── pdf-base64.ts
│   └── pdf-utils.ts
└── fixtures/           # Test data and expected outputs
    └── (sample data files)
```

## Test Types

### Unit Tests (`tests/unit/`)

Proper unit tests using vitest framework. These test individual functions and utilities.

**Run tests:**
```bash
npm test                # Run once
npm run test:watch      # Watch mode (reruns on file changes)
npm run test:ui         # Interactive UI
npm run test:coverage   # With coverage report
```

**Writing unit tests:**
```typescript
import { describe, it, expect } from 'vitest';

describe('My Function', () => {
  it('should do something', () => {
    expect(myFunction()).toBe(expected);
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

Create `tests/integration/<app-name>.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
// Test full app workflow
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

## CI/CD Integration

Tests run automatically in CI:
- On pull requests
- Before merges
- On main branch pushes

**Required:** All tests must pass before merging.

---

*For more info, see `/docs/` for pattern guides.*
