# Feature Specification: File Opener CLI Tool

**Feature Branch**: `002-file-opener-demo`
**Created**: 2025-09-15
**Status**: Draft
**Input**: User description: "file-opener-demo 폴더의 내용을 기반으로 cli를 구성하려해 ../../src 쓰는 구간은 npm install git+https://github.com/mineclover/protocol-registry.git 를 써서 설치된 protocol-registry 를 쓰면 됨"

## Execution Flow (main)
```
1. Parse user description from Input
   → Feature: Convert file-opener-demo to CLI tool using protocol-registry package
2. Extract key concepts from description
   → Actors: Developers/users wanting to open files via custom URL scheme
   → Actions: Register protocol, manage project configurations, open files
   → Data: Project aliases, file paths, configuration settings
   → Constraints: Must use external protocol-registry package instead of local src
3. For each unclear aspect:
   → CLI command name needs to be finalized (considering abbreviated form)
   → Installation method and global availability requirements
4. Fill User Scenarios & Testing section
   → Primary: User installs CLI, registers protocol, adds projects, opens files
5. Generate Functional Requirements
   → Each requirement covers CLI commands, protocol handling, configuration
6. Identify Key Entities
   → CLI commands, Project configurations, Protocol registrations
7. Run Review Checklist
   → Implementation details minimized, focus on user value
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
A developer wants to create clickable links that open specific files in their local editor directly from web pages, documentation, or shared links. They need a way to register a custom URL scheme (`fileopener://`), configure project aliases for their local directories, and seamlessly open files without manually navigating file systems.

### Acceptance Scenarios
1. **Given** the CLI tool is installed globally, **When** a user runs `fopen install`, **Then** the `fileopener://` protocol is registered with the operating system
2. **Given** the protocol is registered, **When** a user runs `fopen add myproject /path/to/project`, **Then** the project alias is stored and can be used in URLs
3. **Given** a project is configured, **When** a user clicks or opens `fileopener://myproject/src/index.js`, **Then** the file opens in their default editor
4. **Given** multiple projects are configured, **When** a user runs `fopen list`, **Then** all configured project aliases and paths are displayed
5. **Given** a project is no longer needed, **When** a user runs `fopen remove myproject`, **Then** the project alias is removed from configuration

### Edge Cases
- What happens when a user tries to open a file that doesn't exist in the configured project?
- How does the system handle attempts to access files outside the project directory (path traversal security)?
- What occurs when the protocol is already registered by another application?
- How does the system behave when configuration files are corrupted or missing?

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST provide a command-line interface for managing the file opener functionality
- **FR-002**: System MUST be installable as a global npm package for easy CLI access
- **FR-003**: System MUST register the `fileopener://` custom URL scheme with the operating system
- **FR-004**: System MUST support adding project aliases that map to local directory paths
- **FR-005**: System MUST support removing project aliases from configuration
- **FR-006**: System MUST list all currently configured project aliases and their paths
- **FR-007**: System MUST handle `fileopener://projectname/path/to/file` URLs to open specific files
- **FR-008**: System MUST validate that requested file paths remain within the configured project boundaries (security)
- **FR-009**: System MUST use the external `protocol-registry` package instead of local source dependencies
- **FR-010**: System MUST create and manage configuration files in the user's home directory (`~/.protocol-registry/`)
- **FR-011**: System MUST provide clear error messages for invalid configurations or missing files
- **FR-012**: System MUST support both legacy query parameter format (`?path=`) and modern path-based format
- **FR-013**: System MUST handle URL decoding for special characters in file paths
- **FR-014**: System MUST log operations for debugging purposes to `~/.protocol-registry/log.txt`
- **FR-015**: System MUST provide JSDoc type hints for better developer experience
- **FR-016**: System MUST support protocol deregistration for clean uninstallation via `fopen uninstall` command

### Key Entities *(include if feature involves data)*
- **CLI Commands**: Installation, project management, protocol registration/deregistration commands using `fopen` as the CLI tool name
- **Project Configuration**: Mapping of project aliases to absolute file system paths, stored in JSON format
- **URL Handler**: Component that processes `fileopener://` URLs and translates them to local file operations
- **Protocol Registration**: System-level registration that associates `fileopener://` scheme with the handler

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---