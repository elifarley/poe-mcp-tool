# Development Workflow

This guide covers the development workflow for the Poe MCP Tool project using the comprehensive Makefile system.

## Quick Start for New Developers

Get up and running in minutes:

```bash
# Clone and set up
git clone https://github.com/jamubc/poe-mcp-tool.git
cd poe-mcp-tool

# One-command setup
make setup

# Configure for local testing (optional)
make install-claude-code

# Start developing
make dev
```

## Daily Development Workflow

### Making Changes

```bash
# Start development with hot reload
make dev

# Or watch for changes only
make watch

# Run tests as you develop
make test

# Type checking
make lint

# Format your code (if prettier installed)
make format
```

### Before Committing

Always run the pre-commit checks:

```bash
make pre-commit
```

This runs:
- TypeScript type checking (`make lint`)
- All tests (`make test`)

If everything passes, you're ready to commit:

```bash
# Using hug (as per project guidelines)
hug add src/your-changed-files
hug c -m "Your descriptive commit message"
```

## Makefile Command Reference

### 🏗️ Build Commands

| Command | Description | When to Use |
|---------|-------------|-------------|
| `make setup` | First-time project setup | New development environment |
| `make build` | Compile TypeScript to `dist/` | Production builds |
| `make clean` | Remove build artifacts | Before full rebuild |
| `make dev` | Development mode with hot reload | Daily development |
| `make watch` | Watch for changes and rebuild | When hot reload isn't needed |

### 🧪 Testing & Quality

| Command | Description | When to Use |
|---------|-------------|-------------|
| `make test` | Run all tests | After making changes |
| `make lint` | TypeScript type checking | After code changes |
| `make format` | Format code (if prettier available) | Before commits |
| `make pre-commit` | Run all pre-commit checks | Before every commit |

### 📦 Deployment & Release

| Command | Description | When to Use |
|---------|-------------|-------------|
| `make publish` | Publish to npm (with safety checks) | Publishing new version |
| `make release` | Full release workflow (build + test + publish + tag) | Official releases |
| `make docs-build` | Build VitePress documentation | Documentation updates |
| `make docs-deploy` | Deploy docs to GitHub Pages | Publishing docs |

### 🔧 Claude Code Integration

| Command | Description | When to Use |
|---------|-------------|-------------|
| `make install-claude-code` | Configure MCP server for Claude Code | First-time setup |
| `make uninstall-claude-code` | Remove from Claude Code config | Cleanup |
| `make test-claude-code` | Test MCP integration | Troubleshooting |
| `make status-claude-code` | Check MCP configuration | Verification |

### 🛠️ Utility Commands

| Command | Description | When to Use |
|---------|-------------|-------------|
| `make deps` | Install/update dependencies | New dependencies added |
| `make update` | Update all dependencies | Regular maintenance |
| `make help` | Show all available commands | Discovery |

## Development Environment Setup

### Prerequisites Validation

The Makefile automatically validates:
- Node.js version (>= 16.0.0)
- Required dependencies are installed

```bash
make check-node  # Manual Node.js version check
```

### Environment Configuration

Set your development environment variables:

```bash
# Required for testing
export POE_API_KEY=your_poe_api_key_here

# Optional: Development logging
export DEBUG=poe-mcp-tool:*
```

### IDE Configuration

For VS Code and other IDEs, add this to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Make: Build",
      "type": "shell",
      "command": "make",
      "args": ["build"],
      "group": "build"
    },
    {
      "label": "Make: Test",
      "type": "shell",
      "command": "make",
      "args": ["test"],
      "group": "test"
    },
    {
      "label": "Make: Watch",
      "type": "shell",
      "command": "make",
      "args": ["watch"],
      "group": "build"
    }
  ]
}
```

## Project Structure Understanding

### Source Code Organization

```
src/
├── index.ts              # Main entry point (MCP server)
├── constants.ts          # Configuration constants
├── services/
│   └── poeChatService.ts # Poe API chat handling
├── tools/                # MCP tool implementations
│   ├── index.ts          # Tool registry
│   ├── registry.ts       # Dynamic tool loading
│   └── *.tool.ts         # Individual tool implementations
└── utils/                # Utility modules
    ├── logger.ts         # Logging utilities
    ├── poeApiClient.ts   # Poe API client
    ├── poeExecutor.ts    # Tool execution manager
    └── timeoutManager.ts # Timeout handling
```

### Build Process

1. **TypeScript Compilation**: `tsc` compiles `src/` to `dist/`
2. **Type Checking**: Comprehensive TypeScript validation
3. **Dependency Resolution**: npm handles all dependencies

## Testing Strategy

### Current Test Status

```bash
make test
# Output: "No tests yet" and exit 0
```

### Future Test Implementation

When tests are added, they'll:
- Run automatically with `make test`
- Be included in `make pre-commit` checks
- Execute in CI/CD pipelines

### Testing Workflow

```bash
# During development
make test              # Quick test run
make pre-commit        # Full validation before commit

# For specific scenarios
make dev               # Start development server
make test-claude-code  # Test MCP integration
```

## Common Development Scenarios

### Adding a New Tool

1. Create new tool in `src/tools/my-tool.ts`
2. Register in `src/tools/registry.ts`
3. Export from `src/tools/index.ts`
4. Run tests: `make test`
5. Check types: `make lint`
6. Test integration: `make test-claude-code`

### Updating Dependencies

```bash
# Update dependencies
make update

# Test everything works
make pre-commit

# If all good, commit
hug add package.json package-lock.json
hug c -m "Update dependencies"
```

### Releasing a New Version

```bash
# Make sure everything is clean
make clean
make pre-commit

# Create release (build + test + publish + tag)
make release

# This will:
# 1. Build the project
# 2. Run tests and linting
# 3. Ask for confirmation
# 4. Create git tag
# 5. Publish to npm
# 6. Push to GitHub
```

### Debugging MCP Integration

```bash
# Check MCP configuration
make status-claude-code

# Test MCP integration
make test-claude-code

# Reinstall if needed
make uninstall-claude-code
make install-claude-code
```

## Best Practices

### Code Quality

- Always run `make pre-commit` before committing
- Use TypeScript for type safety
- Follow existing code patterns and naming conventions
- Add JSDoc comments for new functions

### Git Workflow

- Use `hug` commands instead of `git` (as per project guidelines)
- Write clear, descriptive commit messages
- Keep commits focused and atomic
- Test thoroughly before pushing

### Testing

- Test locally before pushing
- Validate MCP integration after changes
- Use `make help` to discover available commands

### Release Management

- Use `make release` for production releases
- Never publish without running pre-commit checks
- Update version in `package.json` before release
- Tag releases consistently with `v` prefix

## Troubleshooting

### Common Issues

**Build Failures:**
```bash
make clean
make build
```

**TypeScript Errors:**
```bash
make lint
# Fix reported type issues
```

**MCP Integration Issues:**
```bash
make test-claude-code
make status-claude-code
```

**Dependency Issues:**
```bash
make deps
make update
```

### Getting Help

- Run `make help` to see all available commands
- Check each command's output for specific error messages
- Review this documentation for workflow guidance
- Open an issue for persistent problems

This development workflow ensures consistent, high-quality contributions while maximizing developer productivity through the Makefile automation system.