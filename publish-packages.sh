#!/bin/bash

set -e

BETA=false
DRY_RUN=false

# Parse arguments
for arg in "$@"; do
  if [[ "$arg" == "--beta" ]]; then
    BETA=true
  fi
  if [[ "$arg" == "--dry-run" ]]; then
    DRY_RUN=true
  fi
done

# Write .npmrc for auth
echo "//registry.npmjs.org/:_authToken=$NPM_AUTH_TOKEN" > .npmrc

# Navigate to the packages directory
cd packages || exit 1

# Validate versions
echo "Validating package versions..."

for dir in */; do
  version=$(jq -r '.version' "${dir}package.json")

  if [[ "$BETA" == true ]]; then
    if [[ ! "$version" =~ -beta\.[0-9]+$ ]]; then
      echo "❌ Package '${dir}' version '$version' is not a valid beta version."
      exit 1
    fi
  else
    if [[ "$version" =~ -beta\.[0-9]+$ ]]; then
      echo "❌ Package '${dir}' version '$version' is a beta version."
      exit 1
    fi
  fi
done

echo "✅ Version check passed. Starting publish..."

# Loop through each package directory
for dir in */; do
  echo "📦 Publishing package in $dir..."

  # Navigate into the package directory
  cd "$dir" || continue
  
  # Publish the package
  if [[ "$DRY_RUN" == true ]]; then
    npm publish --access public --dry-run
  else
    npm publish --access public
  fi
  
  # Navigate back to the packages directory
  cd ..
done

echo "✅ All packages published."