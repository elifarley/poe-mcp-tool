# Contributing to Poe MCP Tool

We welcome contributions to Poe MCP Tool! This guide will help you get started with development, testing, and submitting your changes.

## Quick Start for Contributors

### Prerequisites

- Node.js v16.0.0 or higher
- Git and familiarity with the workflow
- Poe API key for testing (get one from [poe.com](https://poe.com))

### One-Command Setup

```bash
# Clone and set up the development environment
git clone https://github.com/jamubc/poe-mcp-tool.git
cd poe-mcp-tool

# Automated setup (installs deps, validates environment, builds)
make setup

# Configure for local Claude Code testing (optional)
make install-claude-code

# Start development
make dev
```

## Development Workflow

### Daily Development

```bash
# Start with hot reload
make dev

# Run tests during development
make test

# Type checking
make lint

# Format code (if prettier available)
make format
```

### Before Committing

Always run pre-commit checks:

```bash
make pre-commit
```

This ensures your changes pass all quality checks.

### Git Workflow

We use `hug` for all git operations (as per project guidelines):

```bash
# Stage your changes
hug add src/your-changed-files

# Commit with descriptive message
hug c -m "feat: add new brainstorming methodology"

# Push your changes
hug bpush
```

## Project Structure

```
src/
├── index.ts              # Main MCP server entry point
├── constants.ts          # Project constants and configuration
├── services/
│   └── poeChatService.ts # Poe API interaction logic
├── tools/                # MCP tool implementations
│   ├── index.ts          # Tool registry and exports
│   ├── registry.ts       # Dynamic tool loading system
│   └── *.tool.ts         # Individual tool implementations
└── utils/                # Shared utilities
    ├── logger.ts         # Logging functionality
    ├── poeApiClient.ts   # Poe API client
    ├── poeExecutor.ts    # Tool execution manager
    └── timeoutManager.ts # Timeout handling
```

## Types of Contributions

### 🛠️ Code Contributions

#### Adding New Tools

1. **Create Tool Implementation** in `src/tools/your-tool.ts`:

```typescript
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const yourTool: Tool = {
  name: 'your-tool-name',
  description: 'Description of what your tool does',
  inputSchema: {
    type: 'object',
    properties: {
      // Define your tool's parameters
    },
    required: ['required_param']
  }
};

// Implementation function
export async function executeYourTool(args: any) {
  // Your tool logic here
  return {
    content: [{
      type: 'text',
      text: 'Tool output'
    }]
  };
}
```

2. **Register the Tool** in `src/tools/registry.ts`:

```typescript
import { yourTool, executeYourTool } from './your-tool';

// Add to tools registry
export const tools = {
  // ... existing tools
  'your-tool-name': {
    tool: yourTool,
    handler: executeYourTool
  }
};
```

3. **Export from Index** in `src/tools/index.ts`:

```typescript
export * from './your-tool';
```

4. **Test Your Changes**:

```bash
make test
make lint
make build
```

#### Improving Existing Code

- Follow TypeScript best practices
- Add proper error handling
- Include JSDoc comments for public APIs
- Maintain backward compatibility when possible

### 📚 Documentation Contributions

#### Improving Documentation

- Update README.md for user-facing changes
- Edit docs/ for comprehensive documentation
- Add examples to `docs/usage/examples.md`
- Update API reference in `docs/api.md`

#### Documentation Structure

```
docs/
├── index.md                    # Homepage
├── installation.md             # Installation instructions
├── getting-started.md          # User getting started guide
├── first-steps.md              # Quick start examples
├── concepts/                   # Core concepts
│   ├── how-it-works.md
│   ├── models.md
│   └── sandbox.md
├── usage/                      # Usage guides
│   ├── best-practices.md
│   ├── commands.md
│   ├── examples.md
│   └── development-workflow.md  # Development workflow
└── resources/                  # Additional resources
    ├── faq.md
    ├── roadmap.md
    └── troubleshooting.md
```

### 🐛 Bug Reports

#### Reporting Bugs

1. **Search existing issues** first
2. **Use issue templates** when available
3. **Include details**:
   - Node.js version
   - Operating system
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages

#### Fixing Bugs

1. **Create bugfix branch**:
   ```bash
   hug bc fix/your-bug-description
   ```

2. **Reproduce and fix** the issue
3. **Add tests** if applicable
4. **Run full validation**:
   ```bash
   make pre-commit
   ```

5. **Submit pull request** with clear description

## Makefile Integration

The project uses a comprehensive Makefile to streamline development. All contributors should be familiar with these key commands:

### Essential Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `make setup` | First-time setup | New development environment |
| `make dev` | Development mode | Daily development |
| `make test` | Run tests | After code changes |
| `make lint` | Type checking | Before commits |
| `make pre-commit` | All pre-commit checks | Before every commit |
| `make build` | Production build | Before releases |
| `make release` | Full release workflow | Official releases |

### Development Commands

```bash
# During development
make dev          # Start with hot reload
make watch        # Watch for changes
make test         # Run tests
make lint         # Type checking

# Before committing
make pre-commit   # Run all checks

# Building and deployment
make clean        # Clean artifacts
make build        # Production build
make docs-build   # Build documentation
```

### Claude Code Integration

```bash
make install-claude-code   # Configure for testing
make test-claude-code      # Test MCP integration
make status-claude-code    # Check configuration
```

## Code Standards

### TypeScript Guidelines

- **Use strict TypeScript** configuration
- **Prefer explicit types** over `any`
- **Use interfaces** for object shapes
- **Document public APIs** with JSDoc
- **Handle errors gracefully**

### Code Organization

- **Single responsibility** per module
- **Consistent naming** conventions
- **Clear separation** of concerns
- **Logical imports** and exports

### Testing Standards

When tests are implemented:
- **Test all public functions**
- **Cover edge cases**
- **Mock external dependencies**
- **Use descriptive test names**

## Release Process

### For Maintainers

Use the Makefile for releases:

```bash
# Ensure everything is ready
make clean
make pre-commit

# Create release (automated workflow)
make release
```

This handles:
- Building the project
- Running all tests and checks
- Creating git tags
- Publishing to npm
- Pushing to GitHub

### Version Management

- Update `package.json` version
- Follow semantic versioning
- Create git tags with `v` prefix
- Update changelog in README.md

## Areas for Contribution

### High Priority

- Additional brainstorming methodologies (SCAMPER, Design Thinking extensions)
- Improved auto-routing heuristics
- Better error messages and user feedback
- Test coverage implementation

### Medium Priority

- Documentation improvements
- New MCP client support (Continue, Cursor enhancements)
- Performance optimizations
- Usage analytics and monitoring

### Low Priority

- Code formatting with prettier
- Additional file analysis features
- Enhanced logging and debugging
- Plugin system for custom tools

## Getting Help

### Resources

- **Makefile Commands**: Run `make help` for all available commands
- **Documentation**: Check `docs/` for comprehensive guides
- **Issues**: Open an issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

### Troubleshooting Development

**Build Issues:**
```bash
make clean
make build
```

**TypeScript Errors:**
```bash
make lint
# Fix reported issues
```

**MCP Integration:**
```bash
make test-claude-code
make status-claude-code
```

**Dependency Issues:**
```bash
make deps
make update
```

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow professional standards

### Communication

- Use clear, descriptive commit messages
- Explain the "why" in pull requests
- Ask questions when unsure
- Share knowledge and insights

## Submitting Changes

### Pull Request Process

1. **Fork the repository**
2. **Create feature branch**: `hug bc feature/your-feature`
3. **Make changes** following this guide
4. **Run validation**: `make pre-commit`
5. **Submit pull request** with:
   - Clear title and description
   - Testing steps
   - Screenshots if UI changes
   - Related issues

### Review Process

- All changes require review
- Automated checks must pass
- Documentation updates if needed
- Maintainers will test changes

### Merge Requirements

- All tests pass
- Documentation updated
- No breaking changes without discussion
- Follows code standards

Thank you for contributing to Poe MCP Tool! Your contributions help make this project better for everyone.