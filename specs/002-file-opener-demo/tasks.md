# Tasks: File Opener CLI Tool

**Input**: Design documents from `/specs/002-file-opener-demo/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Extract: Effect CLI framework, TypeScript/Node.js, protocol-registry
   → Libraries: protocol-handler, config-manager, file-opener, cli
2. Load optional design documents:
   → data-model.md: ProjectConfig, FileOpenRequest, CommandResult, LogEntry
   → contracts/: cli-commands.md, url-handler.md → contract test tasks
   → quickstart.md: 5-step setup flow → integration test scenarios
3. Generate tasks by category:
   → Setup: Effect CLI project init, remove existing commands, dependencies
   → Tests: CLI contract tests, protocol handler tests, integration tests
   → Core: data models, service libraries, CLI commands, URL handler
   → Integration: protocol registration, configuration management, logging
   → Polish: unit tests, performance validation, documentation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Shared libraries/files = sequential (no [P])
   → Tests before implementation (TDD strict)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph: Setup → Tests → Models → Services → CLI → Integration → Polish
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
**Single project**: `src/`, `tests/` at repository root per plan.md structure decision

## Phase 3.1: Setup & Project Initialization

- [ ] **T001** Remove all existing CLI commands from `src/` directory (기존에 구현된 커멘드들은 전부 제거해도 됨)
- [ ] **T002** Initialize Effect CLI project structure with TypeScript configuration
- [ ] **T003** Install dependencies: `@effect/cli`, `protocol-registry`, `@effect/platform`
- [ ] **T004** [P] Configure linting (ESLint) and formatting (Prettier) tools for TypeScript
- [ ] **T005** [P] Setup package.json with global CLI binary configuration for `fopen` command

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests (CLI Commands)
- [ ] **T006** [P] Contract test `fopen install` command in `tests/contract/install-command.test.ts`
- [ ] **T007** [P] Contract test `fopen add` command in `tests/contract/add-command.test.ts`
- [ ] **T008** [P] Contract test `fopen list` command in `tests/contract/list-command.test.ts`
- [ ] **T009** [P] Contract test `fopen remove` command in `tests/contract/remove-command.test.ts`
- [ ] **T010** [P] Contract test `fopen uninstall` command in `tests/contract/uninstall-command.test.ts`

### Contract Tests (URL Handler)
- [ ] **T011** [P] Contract test URL parsing (modern format) in `tests/contract/url-parsing.test.ts`
- [ ] **T012** [P] Contract test URL parsing (legacy format) in `tests/contract/url-parsing-legacy.test.ts`
- [ ] **T013** [P] Contract test security validation (path traversal) in `tests/contract/security-validation.test.ts`

### Integration Tests (User Scenarios)
- [ ] **T014** [P] Integration test: Complete setup flow (install → add → test) in `tests/integration/setup-flow.test.ts`
- [ ] **T015** [P] Integration test: File opening workflow in `tests/integration/file-opening.test.ts`
- [ ] **T016** [P] Integration test: Configuration management in `tests/integration/config-management.test.ts`
- [ ] **T017** [P] Integration test: Protocol registration with real OS in `tests/integration/protocol-registration.test.ts`

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Data Models
- [ ] **T018** [P] ProjectConfig model in `src/models/ProjectConfig.ts`
- [ ] **T019** [P] FileOpenRequest model in `src/models/FileOpenRequest.ts`
- [ ] **T020** [P] CommandResult model in `src/models/CommandResult.ts`
- [ ] **T021** [P] LogEntry model in `src/models/LogEntry.ts`

### Service Libraries
- [ ] **T022** [P] Protocol handler service in `src/services/protocol-handler/index.ts`
- [ ] **T023** [P] Config manager service in `src/services/config-manager/index.ts`
- [ ] **T024** [P] File opener service (URL parsing) in `src/services/file-opener/url-parser.ts`
- [ ] **T025** File opener service (path resolution) in `src/services/file-opener/path-resolver.ts`
- [ ] **T026** File opener service (file operations) in `src/services/file-opener/file-operations.ts`
- [ ] **T027** Logging service in `src/services/logging/index.ts`

### CLI Commands (Effect CLI)
- [ ] **T028** [P] Install command implementation in `src/cli/commands/install.ts`
- [ ] **T029** [P] Add command implementation in `src/cli/commands/add.ts`
- [ ] **T030** [P] List command implementation in `src/cli/commands/list.ts`
- [ ] **T031** [P] Remove command implementation in `src/cli/commands/remove.ts`
- [ ] **T032** [P] Uninstall command implementation in `src/cli/commands/uninstall.ts`
- [ ] **T033** Main CLI entry point in `src/cli/index.ts`

### URL Handler Binary
- [ ] **T034** URL handler executable in `src/bin/fopen-handler.ts`

## Phase 3.4: Integration & System Components

- [ ] **T035** Integrate protocol-registry package for cross-platform protocol registration
- [ ] **T036** Configuration file management (create, read, write) with atomic operations
- [ ] **T037** Security validation implementation (path traversal prevention)
- [ ] **T038** Error handling and user-friendly error messages
- [ ] **T039** Structured logging to `~/.protocol-registry/log.txt`
- [ ] **T040** URL decoding and special character handling

## Phase 3.5: Polish & Validation

### Unit Tests
- [ ] **T041** [P] Unit tests for URL parsing logic in `tests/unit/url-parser.test.ts`
- [ ] **T042** [P] Unit tests for path validation in `tests/unit/path-validator.test.ts`
- [ ] **T043** [P] Unit tests for configuration operations in `tests/unit/config-operations.test.ts`

### Performance & Documentation
- [ ] **T044** Performance validation (command response time <100ms)
- [ ] **T045** [P] Update JSDoc type hints across all TypeScript files
- [ ] **T046** [P] Create/update README.md with installation and usage instructions
- [ ] **T047** Manual testing with quickstart.md scenarios
- [ ] **T048** Cross-platform testing (macOS, Windows, Linux)

## Dependencies

### Sequential Dependencies
- **Setup First**: T001-T005 before all other tasks
- **Tests Before Implementation**: T006-T017 before T018-T034
- **Models Before Services**: T018-T021 before T022-T027
- **Services Before CLI**: T022-T027 before T028-T033
- **Core Before Integration**: T018-T034 before T035-T040
- **Integration Before Polish**: T035-T040 before T041-T048

### File-Level Dependencies (same file = sequential)
- **T025 → T026**: Both modify file-opener service files
- **T033 depends on T028-T032**: CLI entry point imports all command modules

## Parallel Execution Examples

### Setup Phase (after T001-T003)
```bash
# Launch T004-T005 together (independent files):
Task: "Configure linting (ESLint) and formatting (Prettier) tools for TypeScript"
Task: "Setup package.json with global CLI binary configuration for fopen command"
```

### Contract Tests Phase
```bash
# Launch T006-T013 together (independent test files):
Task: "Contract test fopen install command in tests/contract/install-command.test.ts"
Task: "Contract test fopen add command in tests/contract/add-command.test.ts"
Task: "Contract test fopen list command in tests/contract/list-command.test.ts"
Task: "Contract test fopen remove command in tests/contract/remove-command.test.ts"
Task: "Contract test fopen uninstall command in tests/contract/uninstall-command.test.ts"
Task: "Contract test URL parsing (modern format) in tests/contract/url-parsing.test.ts"
Task: "Contract test URL parsing (legacy format) in tests/contract/url-parsing-legacy.test.ts"
Task: "Contract test security validation (path traversal) in tests/contract/security-validation.test.ts"
```

### Integration Tests Phase
```bash
# Launch T014-T017 together (independent integration scenarios):
Task: "Integration test: Complete setup flow (install → add → test) in tests/integration/setup-flow.test.ts"
Task: "Integration test: File opening workflow in tests/integration/file-opening.test.ts"
Task: "Integration test: Configuration management in tests/integration/config-management.test.ts"
Task: "Integration test: Protocol registration with real OS in tests/integration/protocol-registration.test.ts"
```

### Data Models Phase
```bash
# Launch T018-T021 together (independent model files):
Task: "ProjectConfig model in src/models/ProjectConfig.ts"
Task: "FileOpenRequest model in src/models/FileOpenRequest.ts"
Task: "CommandResult model in src/models/CommandResult.ts"
Task: "LogEntry model in src/models/LogEntry.ts"
```

### Service Libraries Phase
```bash
# Launch T022-T024 together (independent service directories):
Task: "Protocol handler service in src/services/protocol-handler/index.ts"
Task: "Config manager service in src/services/config-manager/index.ts"
Task: "File opener service (URL parsing) in src/services/file-opener/url-parser.ts"
```

### CLI Commands Phase
```bash
# Launch T028-T032 together (independent command files):
Task: "Install command implementation in src/cli/commands/install.ts"
Task: "Add command implementation in src/cli/commands/add.ts"
Task: "List command implementation in src/cli/commands/list.ts"
Task: "Remove command implementation in src/cli/commands/remove.ts"
Task: "Uninstall command implementation in src/cli/commands/uninstall.ts"
```

## Notes
- **[P] tasks**: Different files, no dependencies - can run in parallel
- **Verify tests fail**: All contract and integration tests MUST fail before implementation
- **TDD strictly enforced**: RED (failing test) → GREEN (minimal implementation) → REFACTOR
- **Real dependencies**: Use actual protocol registration, file system operations (no mocks)
- **Security focus**: Path traversal validation is critical for security requirements
- **Cross-platform**: Test on macOS, Windows, Linux as protocol registration varies by OS

## Task Generation Rules Applied

1. **From Contracts**:
   - cli-commands.md → T006-T010 (contract tests) + T028-T033 (implementations)
   - url-handler.md → T011-T013 (contract tests) + T034 (handler implementation)

2. **From Data Model**:
   - ProjectConfig → T018 + T023 (config manager)
   - FileOpenRequest → T019 + T024-T026 (file opener services)
   - CommandResult → T020 (used by all CLI commands)
   - LogEntry → T021 + T027 (logging service)

3. **From Quickstart Scenarios**:
   - 5-step setup flow → T014 (integration test)
   - File opening workflow → T015 (integration test)
   - Configuration management → T016 (integration test)
   - Protocol registration → T017 (integration test)

## Validation Checklist ✅

- [x] All contracts have corresponding tests (T006-T013 cover both contract files)
- [x] All entities have model tasks (T018-T021 cover all 4 entities)
- [x] All tests come before implementation (Phase 3.2 before 3.3)
- [x] Parallel tasks truly independent (verified file paths don't overlap)
- [x] Each task specifies exact file path
- [x] No [P] task modifies same file as another [P] task
- [x] TDD order enforced: Tests (T006-T017) → Models (T018-T021) → Services (T022-T027) → CLI (T028-T033)
- [x] Constitutional requirements met: Real dependencies, library-per-feature, Effect CLI framework