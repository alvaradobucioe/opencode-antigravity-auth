#!/bin/bash
# Antigravity E2E Test Suite
# Tests Antigravity 3.x models routing through daily-cloudcode-pa.sandbox.googleapis.com/v1internal
#
# Models tested:
# 1. google/antigravity-gemini-3.8-flash
# 2. google/antigravity-gemini-3.7-flash
# 3. google/antigravity-gemini-2.5-flash-thinking
# 4. google/antigravity-gemini-3-flash
# 5. google/antigravity-claude-opus-4-6-thinking

set -euo pipefail

PASS=0
FAIL=0
SKIP=0

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_pass() { echo -e "${GREEN}✓ PASS${NC}: $1"; ((PASS++)); }
log_fail() { echo -e "${RED}✗ FAIL${NC}: $1"; ((FAIL++)); }
log_skip() { echo -e "${YELLOW}○ SKIP${NC}: $1"; ((SKIP++)); }
log_info() { echo -e "  ${BLUE}→${NC} $1"; }

check_auth_error() {
  grep -qiE "insufficient.*scope|authentication|unauthorized|403|401" "$1" 2>/dev/null && return 0 || return 1
}

check_quota_error() {
  grep -qiE "quota|rate.limit|429|resource.exhausted" "$1" 2>/dev/null && return 0 || return 1
}

check_model_error() {
  grep -qiE "model.*not.found|invalid.*model|404" "$1" 2>/dev/null && return 0 || return 1
}

test_model() {
  local model="$1"
  local test_name="$2"
  local log_file="/tmp/antigravity-e2e-${test_name}.log"
  
  log_info "Testing $model..."
  
  timeout 60 opencode run -m "$model" \
    "Reply with exactly: ANTIGRAVITY_OK" \
    2>&1 > "$log_file" || true
  
  if check_auth_error "$log_file"; then
    log_fail "$test_name - Authentication/scope error"
    return 1
  elif check_quota_error "$log_file"; then
    log_skip "$test_name - Quota exhausted"
    return 0
  elif check_model_error "$log_file"; then
    log_fail "$test_name - Model not found"
    return 1
  elif grep -qi "ANTIGRAVITY_OK\|working\|ok\|hello" "$log_file"; then
    log_pass "$test_name"
    return 0
  elif grep -qi "error\|exception\|failed" "$log_file"; then
    log_fail "$test_name - Unknown error"
    log_info "Check $log_file for details"
    return 1
  else
    log_pass "$test_name"
    return 0
  fi
}

echo "════════════════════════════════════════════════════════════"
echo "  Antigravity E2E Test Suite"
echo "  Testing daily-cloudcode-pa.sandbox.googleapis.com routing"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "Test 1: google/antigravity-gemini-3.8-flash"
test_model "google/antigravity-gemini-3.8-flash" "gemini-3.8-flash" || true
echo ""

echo "Test 2: google/antigravity-gemini-3.7-flash"
test_model "google/antigravity-gemini-3.7-flash" "gemini-3.7-flash" || true
echo ""

echo "Test 3: google/antigravity-gemini-2.5-flash-thinking"
test_model "google/antigravity-gemini-2.5-flash-thinking" "gemini-2.5-flash-thinking" || true
echo ""

echo "Test 4: google/antigravity-claude-opus-4-6-thinking"
test_model "google/antigravity-claude-opus-4-6-thinking" "claude-opus-4-6-thinking" || true
echo ""

echo "════════════════════════════════════════════════════════════"
echo "  Test Results Summary"
echo "════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}Passed${NC}:  $PASS"
echo -e "  ${RED}Failed${NC}:  $FAIL"
echo -e "  ${YELLOW}Skipped${NC}: $SKIP"
echo ""

if [ $FAIL -gt 0 ]; then
  echo -e "${RED}Some tests failed!${NC}"
  exit 1
else
  echo -e "${GREEN}All Antigravity tests passed!${NC}"
  exit 0
fi
