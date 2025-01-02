#!/bin/bash

# Get all non-merge commits in the PR
COMMITS=$(git log --format=%s --no-merges origin/$GITHUB_BASE_REF..$GITHUB_SHA)

# Define the regex pattern for Conventional Commits
CC_PATTERN='^(feat|fix|docs|style|refactor|perf|test|build|chore|revert|ops|wip)(\([a-z -]{1,20}\))?!?: [a-zA-Z0-9 _-]{1,50}$'

EXIT_CODE=0

# Check each commit message
while IFS= read -r COMMIT_MSG; do
    # Skip empty lines
    [ -z "$COMMIT_MSG" ] && continue

    # Check if the commit message matches the pattern
    if ! [[ $COMMIT_MSG =~ $CC_PATTERN ]]; then
        echo "❌ Error: Commit message does not follow the Conventional Commits format:"
        echo "  '$COMMIT_MSG'"
        echo "Expected format: <type>[optional scope]!: <description>"
        echo "Examples:"
        echo "  feat(auth): add login functionality"
        echo "  fix: resolve memory leak"
        echo "  feat(api)!: redesign user endpoints"
        echo "  wip: initial implementation"
        EXIT_CODE=1
    fi
done <<< "$COMMITS"

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ All commit messages follow the Conventional Commits format."
fi

exit $EXIT_CODE