import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { Badge, badgeVariants } from '../badge'
import { Progress } from '../progress'
import { Radio, RadioField } from '../radio'
import { Skeleton } from '../skeleton'
import { Stat, StatCard, StatGrid } from '../stat'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../card'
import { EmptyState } from '../empty-state'
import { Avatar } from '../avatar'
import { Field, Input, Label, Textarea } from '../input'
import { toast, Toaster, ToastCard } from '../toast'

// 保護什麼：src/ui 的基本呈現元件（狀態標籤、進度條、單選、骨架、統計格、卡片、空狀態、頭像、輸入框、提示）。
// 這些元件被上百個頁面共用：語意（role／aria）、停用狀態、預設文案與 onChange 簽名一旦改壞，
// 螢幕報讀器、鍵盤操作與舊頁面沿用的 MUI handler 都會一起出錯。

afterEach(cleanup)

describe('Badge：狀態標籤', () => {
  it('預設為 neutral，variant 決定狀態色；呼叫端 className 合併在後', () => {
    render(
      <>
        <Badge data-testid="n">一般</Badge>
        <Badge data-testid="d" variant="danger" className="ml-2">
          停用
        </Badge>
      </>
    )
    expect(screen.getByTestId('n').className).toContain('text-text-secondary')
    expect(screen.getByTestId('d').className).toContain('text-danger')
    expect(screen.getByTestId('d').className).toContain('ml-2')
    expect(screen.getByTestId('d').tagName).toBe('SPAN')
    // 頁面也直接用 badgeVariants 給 Link 套同樣外觀
    expect(badgeVariants({ variant: 'success' })).toContain('text-success')
  })
})

describe('Progress：定值進度條', () => {
  it('以 role=progressbar 與 aria-valuenow 呈現，數值夾限在 0–100', () => {
    const ref = React.createRef()
    const { rerender } = render(<Progress ref={ref} value={42.6} />)
    const bar = screen.getByRole('progressbar')
    expect(ref.current).toBe(bar)
    expect(bar).toHaveAttribute('aria-valuenow', '43')
    expect(bar.firstChild.style.width).toBe('42.6%')

    rerender(<Progress value={180} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
    rerender(<Progress value={-5} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('沒給或給非數字時顯示 0，不讓進度條寬度變成 NaN%', () => {
    const { rerender } = render(<Progress />)
    expect(screen.getByRole('progressbar').firstChild.style.width).toBe('0%')
    rerender(<Progress value="abc" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })
})

describe('Radio／RadioField：原生單選', () => {
  it('RadioField 以 MUI RadioGroup 相同的 (event, value) 呼叫 onChange', () => {
    const onChange = jest.fn()
    render(
      <>
        <RadioField name="g" value="MALE" label="男" onChange={onChange} />
        <RadioField name="g" value="FEMALE" label="女" onChange={onChange} />
      </>
    )
    fireEvent.click(screen.getByLabelText('女'))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][1]).toBe('FEMALE')
    expect(screen.getByLabelText('女')).toBeChecked()
  })

  it('沒有 onChange 也不拋錯（唯讀顯示）', () => {
    render(<RadioField name="g" value="A" label="A" />)
    expect(() => fireEvent.click(screen.getByLabelText('A'))).not.toThrow()
  })

  it('停用時 input 為 disabled，外層標示不可點', () => {
    const ref = React.createRef()
    render(<RadioField ref={ref} name="g" value="A" label="A" disabled labelClassName="lbl" />)
    expect(ref.current).toBe(screen.getByLabelText('A'))
    expect(screen.getByLabelText('A')).toBeDisabled()
    expect(screen.getByText('A').className).toBe('lbl')
    expect(screen.getByText('A').parentElement.className).toContain('cursor-not-allowed')
  })

  it('Radio 單獨使用時仍是 type=radio、可帶 className', () => {
    render(<Radio aria-label="r" className="extra" />)
    expect(screen.getByLabelText('r')).toHaveAttribute('type', 'radio')
    expect(screen.getByLabelText('r').className).toContain('extra')
  })
})

describe('Skeleton：載入佔位', () => {
  it('對報讀器隱藏（aria-hidden），不被當成內容朗讀', () => {
    render(<Skeleton data-testid="sk" className="h-4" />)
    expect(screen.getByTestId('sk')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByTestId('sk').className).toContain('animate-pulse')
  })
})

describe('StatGrid／Stat／StatCard：統計數值', () => {
  it('cols 對應斷點欄數，未知欄數退回 6 欄排法', () => {
    const { rerender } = render(<StatGrid data-testid="g" cols={3} />)
    expect(screen.getByTestId('g').className).toContain('sm:grid-cols-3')
    rerender(<StatGrid data-testid="g" cols={5} />)
    expect(screen.getByTestId('g').className).toContain('xl:grid-cols-6')
    rerender(<StatGrid data-testid="g" />)
    expect(screen.getByTestId('g').className).toContain('xl:grid-cols-6')
  })

  it('Stat 顯示欄名與數值，hint 有給才顯示', () => {
    const { rerender } = render(<Stat label="營收">1,200</Stat>)
    expect(screen.getByText('營收')).toBeInTheDocument()
    expect(screen.getByText('1,200')).toBeInTheDocument()
    expect(screen.queryByText('較上月')).toBeNull()
    rerender(<Stat label="營收" hint="較上月">1,200</Stat>)
    expect(screen.getByText('較上月')).toBeInTheDocument()
  })

  it('StatCard 顯示標題列動作與大數字，hint 可省略', () => {
    const { rerender } = render(
      <StatCard label="入金餘額" action={<button type="button">儲值</button>}>
        500
      </StatCard>
    )
    expect(screen.getByRole('button', { name: '儲值' })).toBeInTheDocument()
    expect(screen.getByText('500').className).toContain('text-display')
    rerender(
      <StatCard label="入金餘額" hint="含贈送">
        500
      </StatCard>
    )
    expect(screen.getByText('含贈送')).toBeInTheDocument()
  })
})

describe('Card：新版卡片', () => {
  it('CardHeader 的 action 有給才畫動作區；各段可帶 className', () => {
    const ref = React.createRef()
    const { container, rerender } = render(
      <Card ref={ref} className="c">
        <CardHeader className="h">
          <CardTitle className="t">標題</CardTitle>
          <CardDescription className="d">說明</CardDescription>
        </CardHeader>
        <CardContent className="b">內容</CardContent>
        <CardFooter className="f">底部</CardFooter>
      </Card>
    )
    expect(ref.current.className).toContain('ui-root')
    expect(screen.getByText('標題').tagName).toBe('H3')
    expect(screen.getByText('說明').tagName).toBe('P')
    expect(screen.getByText('內容').className).toContain('b')
    expect(screen.getByText('底部').className).toContain('f')
    expect(container.querySelector('.h').children).toHaveLength(1)
    rerender(
      <Card>
        <CardHeader className="h" action={<button type="button">編輯</button>}>
          標題
        </CardHeader>
      </Card>
    )
    expect(container.querySelector('.h').children).toHaveLength(2)
    expect(screen.getByRole('button', { name: '編輯' })).toBeInTheDocument()
  })
})

describe('EmptyState：空狀態', () => {
  it('沒給標題時顯示預設「目前沒有資料」與預設圖示', () => {
    const { container } = render(<EmptyState />)
    expect(screen.getByText('目前沒有資料')).toBeInTheDocument()
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('自訂圖示、說明與主要動作', () => {
    const Icon = props => <svg data-testid="icon" {...props} />
    render(<EmptyState icon={Icon} title="尚無帳單" description="今天還沒有帳單" action={<button type="button">打帳單</button>} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('今天還沒有帳單')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '打帳單' })).toBeInTheDocument()
  })
})

describe('Avatar：頭像', () => {
  it('沒有圖片也沒有文字時顯示人像圖示，不留空白圓', () => {
    const { container } = render(<Avatar />)
    expect(container.querySelector('svg')).not.toBeNull()
    expect(container.querySelector('img')).toBeNull()
  })

  it('有圖片時 alt 預設為空字串（裝飾用），載入失敗改顯示文字', () => {
    const { container } = render(<Avatar src="/a.png">王</Avatar>)
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('alt', '')
    fireEvent.error(img)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText('王')).toBeInTheDocument()
  })
})

describe('Input／Textarea／Label／Field', () => {
  it('Textarea 錯誤時 aria-invalid 並以紅框標示；無錯誤時不帶 aria-invalid', () => {
    const ref = React.createRef()
    const { rerender } = render(<Textarea ref={ref} aria-label="備註" invalid />)
    expect(ref.current.tagName).toBe('TEXTAREA')
    expect(screen.getByLabelText('備註')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('備註').className).toContain('border-danger')
    rerender(<Textarea aria-label="備註" />)
    expect(screen.getByLabelText('備註')).not.toHaveAttribute('aria-invalid')
  })

  it('Label required 顯示紅色星號', () => {
    render(<Label required>姓名</Label>)
    expect(screen.getByText('*').className).toContain('text-danger')
  })

  it('Field 沒有 htmlFor 時錯誤訊息不產生錯誤的 id；沒有錯誤時顯示 hint', () => {
    const { rerender } = render(
      <Field label="代號" error="必填">
        <Input />
      </Field>
    )
    expect(screen.getByText('必填')).not.toHaveAttribute('id')
    rerender(
      <Field hint="最多 10 字">
        <Input />
      </Field>
    )
    expect(screen.getByText('最多 10 字').className).toContain('text-text-tertiary')
    expect(screen.queryByText('代號')).toBeNull()
  })
})

describe('toast／ToastCard', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('info／warning 與成功相同 3 秒後自動消失，並顯示說明文字', () => {
    render(<Toaster />)
    act(() => {
      toast.info('已複製', '可直接貼上')
      toast.warning('庫存不足')
    })
    expect(screen.getByText('可直接貼上')).toBeInTheDocument()
    expect(screen.getAllByRole('status')).toHaveLength(2)
    act(() => jest.advanceTimersByTime(3000))
    expect(screen.queryByText('已複製')).toBeNull()
    expect(screen.queryByText('庫存不足')).toBeNull()
  })

  it('ToastCard 預設 info（role=status、polite），未知 variant 仍有圖示；沒有 onClose 不畫關閉鈕', () => {
    const { container, rerender } = render(<ToastCard title="提示" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
    expect(screen.queryByLabelText('關閉')).toBeNull()
    rerender(<ToastCard variant="other" title="提示" trailing={<span>進度</span>} />)
    expect(container.querySelector('svg')).not.toBeNull()
    expect(screen.getByText('進度')).toBeInTheDocument()
  })

  it('錯誤用 role=alert 立即播報', () => {
    render(<ToastCard variant="error" title="失敗" onClose={() => {}} />)
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive')
  })
})
