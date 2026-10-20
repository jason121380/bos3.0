#!/usr/bin/env python3
"""產生 src/ui/grid-compat.css：重現 MUI v5 Grid（v1）的規則，class 名稱與 MUI 相同。
用法：python3 scripts/redesign/gen-grid-css.py
"""
import os

BREAKPOINTS = [('xs', 0), ('sm', 600), ('md', 900), ('lg', 1200), ('xl', 1536)]  # MUI 預設斷點
SPACINGS = [0.5, 1, 2, 3, 4, 5, 6, 8, 10]  # theme.spacing 為 8px


def pct(n):
    # 與 MUI 相同：保留 7 位有效數字
    v = round(n / 12 * 1e8) / 1e6
    return ('%f' % v).rstrip('0').rstrip('.') + '%'


lines = [
    '/*',
    ' * 由 scripts/redesign/gen-grid-css.py 產生，勿手改。',
    ' * 重現 MUI v5 Grid（v1）的規則，class 名稱與 MUI 相同（MuiGrid-root／-container／-item／-grid-{bp}-{n}／-spacing-xs-{n}／-direction-xs-*／-wrap-xs-*），',
    ' * 讓 initialize.scss 的列印與深色模式選擇器照常生效。斷點與 MUI 預設相同：sm 600、md 900、lg 1200、xl 1536。',
    ' */',
    '.MuiGrid-root { box-sizing: border-box; }',
    '.MuiGrid-container { display: flex; flex-wrap: wrap; width: 100%; flex-direction: row; }',
    '.MuiGrid-item { margin: 0; }',
    '.MuiGrid-zeroMinWidth { min-width: 0; }',
]
for d in ['column', 'column-reverse', 'row-reverse']:
    lines.append(f'.MuiGrid-direction-xs-{d} {{ flex-direction: {d}; }}')
    if d.startswith('column'):
        lines.append(f'.MuiGrid-direction-xs-{d} > .MuiGrid-item {{ max-width: none; }}')
for w in ['nowrap', 'wrap-reverse']:
    lines.append(f'.MuiGrid-wrap-xs-{w} {{ flex-wrap: {w}; }}')
for s in SPACINGS:
    px = f'{s * 8:g}px'
    cls = '.MuiGrid-spacing-xs-' + f'{s:g}'.replace('.', '\\.')
    lines.append(f'{cls} {{ width: calc(100% + {px}); margin-top: -{px}; margin-left: -{px}; }}')
    lines.append(f'{cls} > .MuiGrid-item {{ padding-top: {px}; padding-left: {px}; }}')
for bp, min_width in BREAKPOINTS:
    rules = [
        f'.MuiGrid-grid-{bp}-true {{ flex-basis: 0; flex-grow: 1; max-width: 100%; }}',
        f'.MuiGrid-grid-{bp}-auto {{ flex-basis: auto; flex-grow: 0; flex-shrink: 0; max-width: none; width: auto; }}',
    ] + [f'.MuiGrid-grid-{bp}-{n} {{ flex-basis: {pct(n)}; flex-grow: 0; max-width: {pct(n)}; }}' for n in range(1, 13)]
    if min_width == 0:
        lines += rules
    else:
        lines.append(f'@media (min-width: {min_width}px) {{')
        lines += ['  ' + r for r in rules]
        lines.append('}')

out = os.path.join(os.path.dirname(__file__), '../../src/ui/grid-compat.css')
with open(out, 'w', encoding='utf8') as f:
    f.write('\n'.join(lines) + '\n')
