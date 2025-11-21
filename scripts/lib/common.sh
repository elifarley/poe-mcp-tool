#!/bin/bash
# common.sh - Common utilities for all scripts
set -euo pipefail

# Logging functions
log_info() { echo "ℹ️  $*"; }
log_success() { echo "✅ $*"; }
log_warning() { echo "⚠️  $*"; }
log_error() { echo "❌ $*"; }

# Validation functions
validate_command_exists() {
    local cmd="$1"
    if ! command -v "$cmd" >/dev/null 2>&1; then
        log_error "$cmd is required but not installed"
        exit 1
    fi
}

validate_directory_writable() {
    local dir="$1"
    if [[ ! -d "$dir" ]]; then
        log_error "Directory $dir does not exist"
        exit 1
    fi

    if [[ ! -w "$dir" ]]; then
        log_error "Directory $dir is not writable"
        exit 1
    fi
}

validate_required_args() {
    for arg in "$@"; do
        if [[ -z "${!arg}" ]]; then
            log_error "Required argument $arg is not set"
            exit 1
        fi
    done
}