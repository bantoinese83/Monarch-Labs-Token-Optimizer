# Test Suite Documentation

## Overview

This project includes a comprehensive test suite with **187 tests** covering golden cases and edge cases across utilities and components.

## Test Coverage

### Utilities (173 tests)

#### CSV Parser (`src/utils/csvParser.test.ts`) - 33 tests
- **Golden Cases**: Simple CSV, multiple rows, quoted fields, escaped quotes, newlines in quotes, empty fields, trailing commas, different line endings
- **Edge Cases**: Empty CSV, only header, Unicode characters, special characters, malformed CSV, inconsistent columns, very long fields
- **Real-world Cases**: Monarch Genie CSV example

#### Tokenizer (`src/utils/tokenizer.test.ts`) - 34 tests
- **Golden Cases**: JSON, CSV, YAML, TOON formats, structural vs data tokens, nested structures, arrays
- **Edge Cases**: Empty string, whitespace, single character, very long strings, Unicode, special characters, numbers, dates, URLs, emails, booleans, null values, escaped characters, multiline strings
- **Real-world Cases**: Monarch Genie JSON, customer order system JSON

#### Cost Calculator (`src/utils/costCalculator.test.ts`) - 19 tests
- **Golden Cases**: Input/output token costs, context window detection, different models, ROI calculations
- **Edge Cases**: Zero tokens, very large token counts, zero baseline, zero requests, equal tokens, large differences

#### Recommendations Engine (`src/utils/recommendations.test.ts`) - 21 tests
- **Golden Cases**: All formats, context-aware scoring (tabular, nested, config), savings calculations, use cases
- **Edge Cases**: Empty input, zero baseline, equal tokens, large differences, score clamping, negative savings

#### Export Utilities (`src/utils/export.test.ts`) - 27 tests
- **Golden Cases**: CSV export, JSON export, Markdown export, shareable links, comparison summary
- **Edge Cases**: Empty input, special characters, newlines, zero baseline tokens, invalid encoded data

#### Tip Generator (`src/utils/tipGenerator.test.ts`) - 25 tests
- **Golden Cases**: High savings, format-specific tips, context-aware tips, percentage savings
- **Edge Cases**: Zero/negative savings, zero tokens, empty input, very high/low savings, structure/data ratios, API/storage context

### Components (14 tests)

#### CSV Table (`src/components/CSVTable.test.tsx`) - 13 tests
- **Golden Cases**: Header and rows rendering, quoted fields, multiple rows, Monarch Genie example
- **Edge Cases**: Empty CSV, only header, empty fields, inconsistent columns, many columns, Unicode, special characters, malformed CSV

#### Input Form (`src/components/InputForm.test.tsx`) - 15 tests
- **Golden Cases**: Form rendering, input updates, character count, token count, button states
- **Edge Cases**: Empty input, min/max length, special characters, Unicode, multiline, form submission

## Running Tests

```bash
# Run all tests
npm run test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Statistics

- **Total Tests**: 187
- **Test Files**: 8
- **Pass Rate**: 100%
- **Coverage**: Utilities and critical components

## Test Philosophy

### Golden Cases
- Known good inputs/outputs
- Real-world usage scenarios
- Expected behavior validation

### Edge Cases
- Boundary conditions (empty, zero, max values)
- Error conditions (malformed input, invalid data)
- Special characters and Unicode
- Performance scenarios (very large inputs)

## Future Enhancements

- Add integration tests for full user flows
- Add E2E tests with Playwright
- Increase component test coverage
- Add performance benchmarks
- Add visual regression tests

