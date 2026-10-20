import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'

import { Card, CardHeader, CardContent, CardActions } from '../card-compat'

afterEach(cleanup)

describe('ui/card-compat（與 MUI Card 系列相容）', () => {
  // initialize.scss 的列印版面、深色模式與各頁 '& .MuiCardHeader-action' 選擇器都靠 MUI class；少了任何一個列印就跑版
  it('保留 MUI class 名稱', () => {
    const { container } = render(
      <Card>
        <CardHeader title="入金儲值明細" subheader="本月" action={<button type="button">匯出</button>} />
        <CardContent>內容</CardContent>
        <CardActions>
          <button type="button">取消</button>
        </CardActions>
      </Card>
    )
    for (const name of [
      'MuiPaper-root',
      'MuiCard-root',
      'MuiCardHeader-root',
      'MuiCardHeader-content',
      'MuiCardHeader-title',
      'MuiCardHeader-subheader',
      'MuiCardHeader-action',
      'MuiCardContent-root',
      'MuiCardActions-root',
    ]) {
      expect(container.querySelector(`.${name}`)).not.toBeNull()
    }
  })

  // MUI CardHeader 的 title 是 span（AttendanceRecords 等頁以 '.MuiCardHeader-content > span' 調整標題），action 放在標題右側
  it('title 以 span 呈現在內容區，action 在獨立區塊', () => {
    render(<CardHeader title="排班表" action={<button type="button">新增</button>} />)
    const title = screen.getByText('排班表')
    expect(title.tagName).toBe('SPAN')
    expect(title.parentElement).toHaveClass('MuiCardHeader-content')
    expect(screen.getByRole('button', { name: '新增' }).parentElement).toHaveClass('MuiCardHeader-action')
  })

  // 頁面沿用 className／style／id（如 id="DivIdToPrint"）與 ref
  it('className、style、id、ref 都落在根節點', () => {
    const ref = React.createRef()
    render(
      <CardContent ref={ref} id="DivIdToPrint" className="extra" style={{ padding: 0 }}>
        x
      </CardContent>
    )
    expect(ref.current.id).toBe('DivIdToPrint')
    expect(ref.current).toHaveClass('MuiCardContent-root', 'extra')
    expect(ref.current.style.padding).toBe('0px')
  })

  // 報表明細卡片以 css={{ padding: 0 }} 去掉內距：MUI 的 :last-child 規則權重較高，底部仍保留 16px（列印版面依此高度排版）
  it('CardContent 帶有 :last-child 底部內距規則（同 MUI）', () => {
    render(<CardContent>x</CardContent>)
    expect(screen.getByText('x')).toHaveClass('p-4', 'last:pb-4')
  })
})
