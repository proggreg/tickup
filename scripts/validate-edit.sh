#!/bin/bash
# Validate file edits
# Prevents editing sensitive files

FILE_PATH="$1"

# Sensitive files
SENSITIVE_PATTERNS=(
  ".env"
  "credentials"
  "secret"
  "private_key"
  "password"
  ".aws/"
  ".ssh/"
)

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "⚠️  BLOCKED: Cannot edit sensitive file: $FILE_PATH"
    exit 1
  fi
done

echo "✅ Edit validation passed"
exit 0
