# Poe MCP Tool Makefile
# Comprehensive build, deployment, and Claude Code integration

# Project configuration
PROJECT_NAME = poe-mcp-tool
PACKAGE_NAME = $(shell node -p "require('./package.json').name")
VERSION = $(shell node -p "require('./package.json').version")

# Default target
.PHONY: default help
default: help

# Help target - display available commands
help:
	@echo "🔨 Poe MCP Tool Makefile"
	@echo ""
	@echo "🏗️   Build Targets:"
	@echo "  make build          Compile TypeScript to dist/"
	@echo "  make clean          Remove build artifacts"
	@echo "  make dev            Development mode (build + run)"
	@echo "  make watch          Watch for changes and rebuild"
	@echo ""
	@echo "🧪   Development Targets:"
	@echo "  make test           Run tests"
	@echo "  make lint           TypeScript type checking"
	@echo "  make format         Format code (if formatter available)"
	@echo "  make deps            Install/update dependencies"
	@echo ""
	@echo "📦   Deployment Targets:"
	@echo "  make publish        Publish to npm (with safety checks)"
	@echo "  make docs-build     Build VitePress documentation"
	@echo "  make docs-serve     Serve docs locally"
	@echo "  make docs-deploy    Deploy docs to GitHub Pages"
	@echo "  make release        Full release workflow"
	@echo ""
	@echo "🔧   Claude Code Integration:"
	@echo "  make install-claude-code   Configure for Claude Code"
	@echo "  make uninstall-claude-code Remove from Claude Code"
	@echo "  make test-claude-code      Test MCP integration"
	@echo "  make status-claude-code    Check MCP configuration"
	@echo ""
	@echo "🛠️   Utility Targets:"
	@echo "  make setup          First-time project setup"
	@echo "  make update         Update dependencies"
	@echo "  make pre-commit     Run pre-commit checks"

# ============================================================================
# 🏗️   Build Targets
# ============================================================================

.PHONY: build clean dev watch
build: check-node
	@scripts/general/build.sh

clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf dist
	rm -rf docs/.vitepress/dist
	rm -rf node_modules/.cache
	find . -name "*.log" -delete
	@echo "✅ Clean completed"

dev: check-node
	@scripts/general/dev.sh

watch: check-node
	@scripts/general/watch.sh

# ============================================================================
# 🧪   Development Targets
# ============================================================================

.PHONY: test lint format deps check-node
test: check-node
	@scripts/general/test.sh

lint: check-node
	@scripts/general/lint.sh

format:
	@if command -v prettier >/dev/null 2>&1; then \
		echo "🎨 Formatting code..."; \
		npx prettier --write "src/**/*.ts" "*.md"; \
	else \
		echo "⚠️  Prettier not installed. Add to devDependencies to use format target."; \
	fi

deps: check-node
	@echo "📦 Installing dependencies..."
	npm install
	@echo "✅ Dependencies installed"

check-node:
	@scripts/general/check-node.sh

# ============================================================================
# 📦   Deployment Targets
# ============================================================================

.PHONY: publish docs-build docs-serve docs-deploy release
publish: test lint
	@scripts/deployment/publish.sh $(VERSION) $(PACKAGE_NAME)

docs-build: check-node
	@scripts/docs/docs-build.sh

docs-serve: check-node
	@scripts/docs/docs-serve.sh

docs-deploy: docs-build
	@scripts/docs/docs-deploy.sh

release: check-node test lint clean build
	@scripts/deployment/release.sh $(VERSION) $(PACKAGE_NAME)

# ============================================================================
# 🔧   Claude Code Integration Targets
# ============================================================================

.PHONY: install-claude-code uninstall-claude-code test-claude-code status-claude-code
install-claude-code: check-node
	@scripts/claude-code/install-claude-code.sh $(PACKAGE_NAME) $(CLAUDE_CONFIG_DIR)

uninstall-claude-code:
	@scripts/claude-code/uninstall-claude-code.sh $(CLAUDE_CONFIG_DIR)

test-claude-code:
	@scripts/claude-code/test-claude-code.sh $(CLAUDE_CONFIG_DIR)

status-claude-code:
	@scripts/claude-code/status-claude-code.sh $(CLAUDE_CONFIG_DIR)

# ============================================================================
# 🛠️   Utility Targets
# ============================================================================

.PHONY: setup update pre-commit
setup: check-node
	@scripts/general/setup.sh

update: check-node
	@echo "🔄 Updating dependencies..."
	npm update
	@echo "🔍 Running update build..."
	npm run build
	@echo "✅ Dependencies updated"

pre-commit: test lint
	@scripts/general/pre-commit.sh
	@echo ""

# ============================================================================
# 🎯   Quick Start Commands
# ============================================================================

.PHONY: quick-start demo
quick-start: setup install-claude-code
	@echo "🎯 Quick start completed!"
	@echo "🔄 Restart Claude Code and type /mcp to see $(PROJECT_NAME)"

demo: build
	@echo "🎬 Running demo..."
	@echo "💡 This would run a demo of the MCP server functionality"
	@echo "   (Implementation depends on demo requirements)"