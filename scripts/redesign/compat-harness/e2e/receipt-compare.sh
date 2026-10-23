#!/usr/bin/env bash
# 用法：receipt-compare.sh <repoTree> <outDir>；同一入口搭配各樹的 src／Tailwind／全域列印規則。
set -euo pipefail
harness_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_tree="$(cd "$1" && pwd)"
mkdir -p "$2"
out_dir="$(cd "$2" && pwd)"
cd "$repo_tree"
# esbuild 會先採用入口所屬工作樹的 jsconfig.baseUrl，優先於 build.js 的 nodePaths。
# 暫存同一份入口到樹外，確保 before 真正解析 repo_tree/src，而非誤用工作樹。
entry_dir="$(mktemp -d /tmp/bos-receipt-entry.XXXXXX)"
cp "$harness_dir/receipt-compare-entry.js" "$entry_dir/receipt-compare-entry.js"
ESBUILD="$repo_tree/node_modules/esbuild" node "$repo_tree/scripts/redesign/compat-harness/build.js" "$entry_dir/receipt-compare-entry.js" "$out_dir"
node_modules/.bin/tailwindcss -c "$repo_tree/tailwind.config.js" -i "$repo_tree/src/styles/tokens.css" -o "$out_dir/tailwind.css" --minify
# 與 App 相同的全域 reset／捲軸，主題載入的 initialize.scss 最後套用。
node_modules/.bin/sass --no-source-map src/assets/scss/main.scss "$out_dir/global.css"
node_modules/.bin/sass --no-source-map src/initialize.scss "$out_dir/print.css"
cat node_modules/react-perfect-scrollbar/dist/css/styles.css >> "$out_dir/global.css"
# 外部 runner 若未傳 NODE_PATH，沿用環境已快取的 Playwright，不安裝套件。
if ! node -e "require.resolve('playwright')" >/dev/null 2>&1; then
  for cached_modules in "${HOME}"/.npm/_npx/*/node_modules /home/box/.npm/_npx/*/node_modules; do
    if [[ -f "$cached_modules/playwright/package.json" ]]; then
      export NODE_PATH="$cached_modules${NODE_PATH:+:$NODE_PATH}"
      break
    fi
  done
fi
node "$harness_dir/receipt-compare-run.js" "$out_dir"
