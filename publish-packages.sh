#!/bin/bash

# Navigate to the packages directory
cd packages || exit

# Loop through each package directory
for dir in */; do
  # Navigate into the package directory
  cd "$dir" || continue
  
  # Publish the package
  echo "Publishing package in $dir..."
  npm publish --access public
  
  # Navigate back to the packages directory
  cd ..
done

echo "All packages published."