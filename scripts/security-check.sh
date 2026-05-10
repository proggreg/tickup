#!/bin/bash
# Security check for bash operations
# Blocks destructive patterns

COMMAND="$1"

# Dangerous patterns
DANGEROUS_PATTERNS=(
  "rm -rf"
  "DROP TABLE"
  "DELETE FROM"
  "git reset --hard"
  "git push --force"
  "git rebase -i"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if [[ "$COMMAND" == *"$pattern"* ]]; then
    echo "⚠️  BLOCKED: Dangerous operation detected: $pattern"
    echo "Confirm manually before proceeding"
    exit 1
  fi
done

echo "✅ Security check passed"
exit 0
