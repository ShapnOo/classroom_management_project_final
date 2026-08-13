#!/bin/bash
FILES="src/components/dashboard/teacher/*.tsx"

for f in $FILES; do
  sed -i '' 's/text-sm/text-\[13px\]/g' "$f"
  sed -i '' 's/text-base/text-sm/g' "$f"
  sed -i '' 's/text-lg/text-base/g' "$f"
  sed -i '' 's/text-xl/text-lg/g' "$f"
  sed -i '' 's/text-2xl/text-xl/g' "$f"
  sed -i '' 's/font-bold/font-medium/g' "$f"
  sed -i '' 's/font-semibold/font-medium/g' "$f"
done
echo "Fonts adjusted."
