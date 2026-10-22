import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { Chip, Collapse, Hidden, IconButton, Menu, MenuItem, Rating, Tooltip, useMediaQuery } from '../misc-compat'

// 保護什麼：舊頁面零星相容元件（ui/misc-compat）在 misc-compat.test.js 以外的行為：
// - IconButton／Chip／Collapse 輸出 MUI 同名 class（列印與深色模式樣式靠它）。
// - useMediaQuery／Hidden：斷點與 MUI 相同（sm 600、md 900…），noSsr=false 時先回傳 defaultMatches、掛載後才換成實際值（預約行事曆依此時序初始化）；
//   舊版 Safari 只有 addListener 也要能監聽。
// - Tooltip：文字型 title 當成 aria-label、非文字以 aria-describedby 關聯；保留子元素原本的事件；受控 open。
// - Rating：滑過預覽、唯讀／停用不可改、非受控記住值。
// - Menu：依 anchorOrigin 對齊、開啟時聚焦第一項、上下鍵循環、Tab 關閉（reason=tabKeyDown）；MenuItem 的 Enter／空白鍵等同點擊。

// Menu 內含相容層 Modal：卸載包在 act 裡，讓 React 17 非同步的 effect 清除（還原 aria-hidden、捲動鎖）在下一個測試前完成
afterEach(() => {
  act(() => {
    cleanup()
  })
})

describe('IconButton', () => {
  it('預設 medium、不輸出 colorDefault；color／size／type 可改；ref 指到按鈕', () => {
    const ref = React.createRef()
    const { rerender } = render(<IconButton ref={ref} aria-label="刪除" />)
    const btn = screen.getByRole('button', { name: '刪除' })
    expect(ref.current).toBe(btn)
    expect(btn).toHaveAttribute('type', 'button')
    expect(btn).toHaveClass('MuiIconButton-root', 'MuiIconButton-sizeMedium')
    expect(btn.className).not.toContain('MuiIconButton-colorDefault')
    rerender(<IconButton aria-label="刪除" color="primary" size="small" type="submit" />)
    expect(screen.getByRole('button')).toHaveClass('MuiIconButton-colorPrimary', 'MuiIconButton-sizeSmall')
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })
})

describe('Chip', () => {
  it('不可刪除時不是按鈕、沒有刪除圖示；onKeyUp 照常呼叫', () => {
    const onKeyUp = jest.fn()
    const { container } = render(<Chip label="VIP" onKeyUp={onKeyUp} />)
    expect(screen.queryByRole('button')).toBeNull()
    expect(container.querySelector('svg')).toBeNull()
    fireEvent.keyUp(container.firstChild, { key: 'Backspace' })
    expect(onKeyUp).toHaveBeenCalled()
  })

  it('Delete 鍵刪除；其他按鍵或在子元素上的按鍵不刪除', () => {
    const onDelete = jest.fn()
    render(<Chip label={<span>生日</span>} onDelete={onDelete} />)
    const chip = screen.getByRole('button')
    fireEvent.keyUp(chip, { key: 'Delete' })
    fireEvent.keyUp(chip, { key: 'a' })
    fireEvent.keyUp(screen.getByText('生日'), { key: 'Delete' })
    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})

describe('Collapse', () => {
  it('展開時為 entered；unmountOnExit 收合時卸載', () => {
    const { container, rerender } = render(<Collapse in>內容</Collapse>)
    expect(container.firstChild).toHaveClass('MuiCollapse-entered')
    rerender(
      <Collapse in={false} unmountOnExit>
        內容
      </Collapse>
    )
    expect(container.innerHTML).toBe('')
    rerender(<Collapse>內容</Collapse>)
    expect(container.firstChild).toHaveClass('MuiCollapse-hidden')
  })
})

// matchMedia 替身：依查詢字串判斷，可觸發 change；legacy 時只有 addListener
const mockMatchMedia = (match, { legacy = false } = {}) => {
  const listeners = new Set()
  const lists = []
  const original = window.matchMedia
  window.matchMedia = query => {
    const mql = { query, get matches() { return match(query) } }
    if (legacy) {
      mql.addListener = fn => listeners.add(fn)
      mql.removeListener = fn => listeners.delete(fn)
    } else {
      mql.addEventListener = (_, fn) => listeners.add(fn)
      mql.removeEventListener = (_, fn) => listeners.delete(fn)
    }
    lists.push(mql)
    return mql
  }
  return {
    fire: () => act(() => listeners.forEach(fn => fn())),
    count: () => listeners.size,
    queries: () => lists.map(l => l.query),
    restore: () => {
      window.matchMedia = original
    },
  }
}

describe('useMediaQuery', () => {
  const Probe = ({ query, options }) => <span data-testid="m">{String(useMediaQuery(query, options))}</span>

  it('預設先回傳 defaultMatches、掛載後換成實際值；可傳 theme.breakpoints 產生的 "@media …" 字串', () => {
    let narrow = true
    const mm = mockMatchMedia(() => narrow)
    const seen = []
    const Spy = () => {
      const m = useMediaQuery('@media (max-width:599.95px)')
      seen.push(m)
      return null
    }
    render(<Spy />)
    expect(seen[0]).toBe(false)
    expect(seen[seen.length - 1]).toBe(true)
    expect(mm.queries()).toContain('(max-width:599.95px)')
    narrow = false
    mm.fire()
    expect(seen[seen.length - 1]).toBe(false)
    mm.restore()
  })

  it('noSsr 時第一次渲染就是實際值；舊版 Safari（addListener）也能監聽並在卸載時移除', () => {
    const mm = mockMatchMedia(() => true, { legacy: true })
    const { unmount } = render(<Probe query="(min-width: 600px)" options={{ noSsr: true }} />)
    expect(screen.getByTestId('m')).toHaveTextContent('true')
    expect(mm.count()).toBe(1)
    act(() => unmount())
    expect(mm.count()).toBe(0)
    mm.restore()
  })

  it('環境沒有 matchMedia 時維持 defaultMatches', () => {
    const original = window.matchMedia
    delete window.matchMedia
    render(<Probe query="(min-width: 600px)" options={{ defaultMatches: true }} />)
    expect(screen.getByTestId('m')).toHaveTextContent('true')
    window.matchMedia = original
  })
})

describe('Hidden（斷點同 MUI）', () => {
  const cases = [
    ['xsDown', '(max-width: -0.05px)'],
    ['mdDown', '(max-width: 899.95px)'],
    ['lgDown', '(max-width: 1199.95px)'],
    ['xlDown', '(max-width: 1535.95px)'],
    ['xsUp', '(min-width: 0px)'],
    ['smUp', '(min-width: 600px)'],
    ['mdUp', '(min-width: 900px)'],
    ['lgUp', '(min-width: 1200px)'],
    ['xlUp', '(min-width: 1536px)'],
  ]
  it.each(cases)('%s 對應 %s：符合時隱藏、不符合時顯示', (prop, query) => {
    let hit = true
    const mm = mockMatchMedia(q => q === query && hit)
    const { rerender } = render(<Hidden {...{ [prop]: true }}>內容</Hidden>)
    expect(screen.queryByText('內容')).toBeNull()
    hit = false
    mm.fire()
    rerender(<Hidden {...{ [prop]: true }}>內容</Hidden>)
    expect(screen.getByText('內容')).toBeInTheDocument()
    mm.restore()
  })

  it('only 一律隱藏；沒有任何條件時顯示', () => {
    const mm = mockMatchMedia(() => false)
    const { rerender } = render(<Hidden only="xs">內容</Hidden>)
    expect(screen.queryByText('內容')).toBeNull()
    rerender(<Hidden>內容</Hidden>)
    expect(screen.getByText('內容')).toBeInTheDocument()
    mm.restore()
  })
})

describe('Tooltip', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('文字 title 當成子元素的 aria-label（子元素已有 aria-label 或 describeChild 時不覆蓋）', () => {
    const { rerender } = render(
      <Tooltip title="編輯">
        <button type="button">✎</button>
      </Tooltip>
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', '編輯')
    rerender(
      <Tooltip title="編輯">
        <button type="button" aria-label="編輯顧客">
          ✎
        </button>
      </Tooltip>
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', '編輯顧客')
    rerender(
      <Tooltip title="編輯" describeChild>
        <button type="button">✎</button>
      </Tooltip>
    )
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-label')
  })

  it('保留子元素的 ref 與滑鼠／焦點事件；聚焦顯示、失焦依 leaveDelay 隱藏；沒有箭頭時不畫箭頭', () => {
    const ref = React.createRef()
    const handlers = { onMouseEnter: jest.fn(), onMouseLeave: jest.fn(), onFocus: jest.fn(), onBlur: jest.fn() }
    render(
      <Tooltip title="說明" placement="top-start" leaveDelay={200}>
        <button type="button" ref={ref} {...handlers}>
          ?
        </button>
      </Tooltip>
    )
    const btn = screen.getByRole('button')
    expect(ref.current).toBe(btn)
    fireEvent.focus(btn)
    fireEvent.focusIn(btn)
    act(() => jest.advanceTimersByTime(100))
    const tip = screen.getByRole('tooltip')
    expect(tip.querySelector('.MuiTooltip-arrow')).toBeNull()
    expect(tip.firstChild.className).toMatch(/MuiTooltip-tooltipPlacement(Top|Bottom)/)
    fireEvent.focusOut(btn)
    act(() => jest.advanceTimersByTime(199))
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    act(() => jest.advanceTimersByTime(1))
    expect(screen.queryByRole('tooltip')).toBeNull()
    fireEvent.mouseEnter(btn)
    fireEvent.mouseLeave(btn)
    act(() => jest.advanceTimersByTime(500))
    expect(screen.queryByRole('tooltip')).toBeNull()
    expect(handlers.onMouseEnter).toHaveBeenCalled()
    expect(handlers.onMouseLeave).toHaveBeenCalled()
    expect(handlers.onFocus).toHaveBeenCalled()
    expect(handlers.onBlur).toHaveBeenCalled()
  })

  it('受控 open；title 為空時不顯示；子元素函式 ref 也會收到節點', () => {
    const fnRef = jest.fn()
    const { rerender } = render(
      <Tooltip title={<b>詳細</b>} open>
        <span ref={fnRef} aria-describedby="orig">
          i
        </span>
      </Tooltip>
    )
    expect(fnRef).toHaveBeenCalled()
    expect(screen.getByRole('tooltip')).toHaveTextContent('詳細')
    expect(screen.getByText('i')).toHaveAttribute('aria-describedby', screen.getByRole('tooltip').id)
    rerender(
      <Tooltip title="" open>
        <span aria-describedby="orig">i</span>
      </Tooltip>
    )
    expect(screen.queryByRole('tooltip')).toBeNull()
    expect(screen.getByText('i')).toHaveAttribute('aria-describedby', 'orig')
  })

  it('子元素沒有自己的事件處理時，滑入／移出／聚焦／失焦照樣控制顯示', () => {
    render(
      <Tooltip title="說明">
        <span>i</span>
      </Tooltip>
    )
    const el = screen.getByText('i')
    fireEvent.focusIn(el)
    act(() => jest.advanceTimersByTime(100))
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    fireEvent.focusOut(el)
    act(() => jest.advanceTimersByTime(0))
    expect(screen.queryByRole('tooltip')).toBeNull()
    fireEvent.mouseEnter(el)
    act(() => jest.advanceTimersByTime(100))
    fireEvent.mouseLeave(el)
    act(() => jest.advanceTimersByTime(0))
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('arrow：左右側時箭頭以 top 定位', () => {
    render(
      <Tooltip title="說明" arrow open placement="right">
        <span>i</span>
      </Tooltip>
    )
    act(() => jest.runOnlyPendingTimers())
    expect(screen.getByRole('tooltip').querySelector('.MuiTooltip-arrow')).not.toBeNull()
  })

  it('arrow：箭頭位置來自 floating-ui（沒有座標時不設定）', () => {
    render(
      <Tooltip title="說明" arrow open>
        <span>i</span>
      </Tooltip>
    )
    const arrow = screen.getByRole('tooltip').querySelector('.MuiTooltip-arrow')
    expect(arrow).not.toBeNull()
    expect(screen.getByRole('tooltip').firstChild).toHaveClass('MuiTooltip-tooltipArrow')
  })

  it('卸載時清掉計時器（不在卸載後 setState）', () => {
    const { unmount } = render(
      <Tooltip title="說明">
        <span>i</span>
      </Tooltip>
    )
    fireEvent.mouseEnter(screen.getByText('i'))
    unmount()
    expect(() => act(() => jest.runAllTimers())).not.toThrow()
  })
})

describe('Rating', () => {
  it('非受控（defaultValue）點星改值；滑過預覽、移出還原；沒有 onChange 不拋錯', () => {
    const { container } = render(<Rating name="r" defaultValue={2} size="small" />)
    const filled = () => container.querySelectorAll('.MuiRating-iconFilled').length
    expect(container.firstChild).toHaveClass('MuiRating-sizeSmall')
    expect(filled()).toBe(2)
    fireEvent.mouseEnter(screen.getByLabelText('4 Stars').parentElement)
    expect(filled()).toBe(4)
    expect(container.querySelector('.MuiRating-iconHover')).not.toBeNull()
    fireEvent.mouseLeave(container.firstChild)
    expect(filled()).toBe(2)
    fireEvent.click(screen.getByLabelText('5 Stars'))
    expect(filled()).toBe(5)
    expect(screen.getByLabelText('1 Star')).toBeInTheDocument()
  })

  it('沒有值時全部為空星', () => {
    const { container } = render(<Rating name="r" />)
    expect(container.querySelectorAll('.MuiRating-iconFilled')).toHaveLength(0)
  })

  it('唯讀或停用時不可改值、不預覽', () => {
    const onChange = jest.fn()
    const { container, rerender } = render(<Rating name="r" value={2} readOnly onChange={onChange} />)
    expect(container.firstChild).toHaveClass('MuiRating-readOnly')
    fireEvent.mouseEnter(screen.getByLabelText('4 Stars').parentElement)
    fireEvent.click(screen.getByLabelText('4 Stars'))
    fireEvent.click(screen.getByLabelText('2 Stars'))
    expect(onChange).not.toHaveBeenCalled()
    expect(container.querySelectorAll('.MuiRating-iconFilled')).toHaveLength(2)
    rerender(<Rating name="r" value={2} disabled onChange={onChange} />)
    expect(container.firstChild).toHaveClass('Mui-disabled')
    fireEvent.mouseEnter(screen.getByLabelText('4 Stars').parentElement)
    expect(container.querySelectorAll('.MuiRating-iconFilled')).toHaveLength(2)
  })
})

describe('Menu／MenuItem', () => {
  const anchor = rect => {
    const el = document.createElement('button')
    el.getBoundingClientRect = () => ({ top: 100, bottom: 140, left: 200, right: 300, width: 100, height: 40, ...rect })
    document.body.append(el)
    return el
  }
  const paper = () => document.querySelector('.MuiMenu-paper')

  it('依 anchorOrigin 對齊錨點（不小於 16px），開啟時聚焦第一項', () => {
    const el = anchor()
    const { rerender } = render(
      <Menu open anchorEl={el} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <MenuItem>編輯</MenuItem>
        <MenuItem>刪除</MenuItem>
      </Menu>
    )
    expect(paper().style.top).toBe('140px')
    expect(paper().style.left).toBe('300px')
    expect(document.activeElement).toBe(screen.getByText('編輯'))
    rerender(
      <Menu open anchorEl={() => el} anchorOrigin={{ vertical: 'center', horizontal: 'center' }}>
        <MenuItem>編輯</MenuItem>
      </Menu>
    )
    expect(paper().style.top).toBe('120px')
    expect(paper().style.left).toBe('250px')
    cleanup()
    const corner = anchor({ top: 2, left: 3 })
    render(
      <Menu open anchorEl={corner}>
        <MenuItem>編輯</MenuItem>
      </Menu>
    )
    expect(paper().style.top).toBe('16px')
    expect(paper().style.left).toBe('16px')
    el.remove()
    corner.remove()
  })

  it('沒有錨點時先隱藏（不閃在左上角）；選單沒有項目時開啟不拋錯；一開始關閉時不計算位置', () => {
    const { rerender } = render(<Menu open={false} anchorEl={null} />)
    expect(paper()).toBeNull()
    rerender(<Menu open anchorEl={null} />)
    expect(paper().style.visibility).toBe('hidden')
  })

  it('上下鍵循環移動；Tab 以 reason=tabKeyDown 關閉；沒有 onClose 時 Tab 不攔截；其他按鍵不處理', () => {
    const el = anchor()
    const onClose = jest.fn()
    const { rerender } = render(
      <Menu open anchorEl={el} onClose={onClose}>
        <MenuItem>甲</MenuItem>
        <MenuItem>乙</MenuItem>
      </Menu>
    )
    const menu = screen.getByRole('menu')
    fireEvent.keyDown(menu, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(screen.getByText('乙'))
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(screen.getByText('甲'))
    fireEvent.keyDown(menu, { key: 'Tab' })
    expect(onClose).toHaveBeenCalledWith(expect.anything(), 'tabKeyDown')
    rerender(
      <Menu open anchorEl={el}>
        <MenuItem>甲</MenuItem>
      </Menu>
    )
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    screen.getByRole('menu').dispatchEvent(tab)
    expect(tab.defaultPrevented).toBe(false)
    const other = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true })
    screen.getByRole('menu').dispatchEvent(other)
    expect(other.defaultPrevented).toBe(false)
    el.remove()
  })

  it('PaperProps／MenuListProps 照傳；關閉時不渲染', () => {
    const el = anchor()
    const { rerender } = render(
      <Menu open anchorEl={el} PaperProps={{ 'data-testid': 'paper' }} MenuListProps={{ 'aria-label': '更多' }}>
        <MenuItem>甲</MenuItem>
      </Menu>
    )
    expect(screen.getByTestId('paper')).toBeInTheDocument()
    expect(document.querySelector('[role="menu"]')).toHaveAttribute('aria-label', '更多')
    rerender(
      <Menu open={false} anchorEl={el}>
        <MenuItem>甲</MenuItem>
      </Menu>
    )
    expect(screen.queryByRole('menu')).toBeNull()
    el.remove()
  })

  it('MenuItem：Enter／空白鍵等同點擊；onKeyDown 先收到；子元素上的按鍵與沒有 onClick 時不觸發', () => {
    const onClick = jest.fn()
    const onKeyDown = jest.fn()
    const { rerender } = render(
      <ul>
        <MenuItem onClick={onClick} onKeyDown={onKeyDown}>
          <span>刪除</span>
        </MenuItem>
      </ul>
    )
    const li = screen.getByRole('menuitem')
    fireEvent.keyDown(li, { key: 'Enter' })
    fireEvent.keyDown(li, { key: ' ' })
    fireEvent.keyDown(li, { key: 'a' })
    fireEvent.keyDown(screen.getByText('刪除'), { key: 'Enter' })
    expect(onClick).toHaveBeenCalledTimes(2)
    expect(onKeyDown).toHaveBeenCalledTimes(4)
    rerender(
      <ul>
        <MenuItem>刪除</MenuItem>
      </ul>
    )
    expect(() => fireEvent.keyDown(screen.getByRole('menuitem'), { key: 'Enter' })).not.toThrow()
  })
})
