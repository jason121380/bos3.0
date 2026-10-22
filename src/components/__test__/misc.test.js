// 保護：首次登入強制改密碼、列表頁共用表格卡片、品項組合的左右移轉清單、GA／頁面標題。
// 改密碼：兩次輸入不一致時標示錯誤、不送出；一致才送出 mutation，成功後把登入者的「需改密碼」旗標反轉存回並關閉。
// 表格卡片：筆數、匯出 CSV 檔名、分頁與每頁筆數回呼、可隱藏分頁。
// 移轉清單：勾選左邊加入右邊（保留原有順序、可重複）、勾選右邊移除；只顯示 display 為 true 的選項；右邊空的時候提示。
import { act, cleanup, fireEvent, screen, wait } from '@testing-library/react'
import React from 'react'

import { callsOf, loginAs, renderPage, typeLikeBrowser } from '__tests__/testkit.test'
import ChangePassword from 'components/ChangePassword'
import CustomizedSnackbars from 'elements/snackbars'
import ManagementTable from 'components/ManagementTable'
import TransferList from 'components/TransferList'
import { TableBody, TableCell, TableHead, TableRow } from 'ui/table'

afterEach(cleanup)

describe('ChangePassword 強制改密碼', () => {
  const renderDialog = (fixtures = { CHANGE_PASSWORD: { changePassword: true } }) => {
    loginAs({ user: { id: 'user-1', name: '店長', isNeedChangePassword: true } })
    const handleClose = jest.fn()
    const utils = renderPage(
      <>
        <ChangePassword open handleClose={handleClose} />
        <CustomizedSnackbars />
      </>,
      { fixtures }
    )
    const password = screen.getByLabelText('密碼')
    const second = screen.getByLabelText('確認密碼')
    return { ...utils, handleClose, password, second }
  }

  it('沒有關閉鈕（必須改完才能用）；密碼欄預設隱藏，可切換顯示', () => {
    const { password, second } = renderDialog()
    expect(screen.getByRole('dialog', { name: '重新設定密碼' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '關閉' })).toBeNull()
    expect(password).toHaveAttribute('type', 'password')
    const toggles = screen.getAllByRole('button', { name: 'toggle password visibility' })
    fireEvent.click(toggles[0])
    expect(password).toHaveAttribute('type', 'text')
    fireEvent.mouseDown(toggles[1])
    fireEvent.click(toggles[1])
    expect(second).toHaveAttribute('type', 'text')
    fireEvent.click(toggles[1])
    expect(second).toHaveAttribute('type', 'password')
  })

  it('兩次不一致：後打的欄位標示錯誤，按更新只提示不送出', async () => {
    const { password, second, calls, handleClose } = renderDialog()
    typeLikeBrowser(password, 'abc123')
    expect(password).not.toHaveAttribute('aria-invalid', 'true')
    typeLikeBrowser(second, 'abc124')
    expect(second).toHaveAttribute('aria-invalid', 'true')
    typeLikeBrowser(password, 'abc125')
    expect(password).toHaveAttribute('aria-invalid', 'true')
    fireEvent.click(screen.getByRole('button', { name: '更新密碼' }))
    // 對話框開著時外面的提示區被 Radix 設為 aria-hidden，以 hidden: true 查
    expect(await screen.findByRole('alert', { hidden: true })).toHaveTextContent('確認密碼是否填寫正確')
    expect(callsOf(calls, 'CHANGE_PASSWORD')).toHaveLength(0)
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('沒填就按更新：提示不送出', async () => {
    const { calls } = renderDialog()
    fireEvent.click(screen.getByRole('button', { name: '更新密碼' }))
    expect(await screen.findByRole('alert', { hidden: true })).toHaveTextContent('確認密碼是否填寫正確')
    expect(callsOf(calls, 'CHANGE_PASSWORD')).toHaveLength(0)
  })

  it('一致：送出新密碼，成功後反轉「需改密碼」並只存允許的欄位、關閉、提示成功', async () => {
    const { password, second, calls, handleClose, settle } = renderDialog()
    typeLikeBrowser(second, 'newpass')
    typeLikeBrowser(password, 'newpass')
    expect(password).not.toHaveAttribute('aria-invalid', 'true')
    fireEvent.click(screen.getByRole('button', { name: '更新密碼' }))
    await settle()
    expect(callsOf(calls, 'CHANGE_PASSWORD')[0].variables).toEqual({ input: { password: 'newpass', secondPassword: 'newpass' } })
    await wait(() => expect(handleClose).toHaveBeenCalledTimes(1))
    // setupTests 的 localStorage 假物件會再 JSON.stringify 一次
    expect(JSON.parse(JSON.parse(localStorage.getItem('user')))).toEqual({ id: 'user-1', name: '店長', isNeedChangePassword: false })
    expect(screen.getByRole('status', { hidden: true })).toHaveTextContent('成功變更密碼')
  })
})

describe('ManagementTable 列表表格卡片', () => {
  const body = (
    <TableBody>
      <TableRow>
        <TableCell>王小明</TableCell>
      </TableRow>
    </TableBody>
  )

  it('顯示標題與筆數；有匯出資料時提供 CSV 下載（預設檔名 data.csv）；自訂動作放在右上', () => {
    const { container, rerender } = renderPage(
      <ManagementTable
        title="顧客列表"
        totalCount={42}
        excelData={[{ 姓名: '王小明' }]}
        tableHead={<TableHead>姓名</TableHead>}
        pageLimit={10}
        pageOffset={0}
        onPageChange={() => {}}
        onRowsPerPageChange={() => {}}
        headerAction={<button type="button">新增</button>}
        className="extra"
        size="small"
      >
        {body}
      </ManagementTable>
    )
    expect(screen.getByRole('heading', { name: '顧客列表' })).toBeInTheDocument()
    expect(screen.getByText('共 42 筆')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '報表匯出' })).toHaveAttribute('download', 'data.csv')
    expect(screen.getByRole('button', { name: '新增' })).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('extra')
    expect(screen.getByRole('cell', { name: '王小明' })).toBeInTheDocument()
    expect(rerender).toBeDefined()
  })

  it('分頁：上一頁／下一頁與每頁筆數回呼；可自訂檔名；hidePagination 時不顯示分頁', () => {
    const onPageChange = jest.fn()
    const onRowsPerPageChange = jest.fn()
    renderPage(
      <ManagementTable
        title="帳單"
        totalCount={30}
        excelData={[]}
        excelFilename="帳單.csv"
        tableHead={<TableHead>編號</TableHead>}
        pageLimit={10}
        pageOffset={1}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        className={{ legacy: true }}
      >
        {body}
      </ManagementTable>
    )
    expect(screen.getByRole('link', { name: '報表匯出' })).toHaveAttribute('download', '帳單.csv')
    expect(screen.getByText('11–20 / 共 30 筆')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '下一頁' }))
    expect(onPageChange.mock.calls[0][1]).toBe(2)
    fireEvent.click(screen.getByRole('button', { name: '上一頁' }))
    expect(onPageChange.mock.calls[1][1]).toBe(0)
    fireEvent.change(screen.getByLabelText('每頁筆數'), { target: { value: '1' } })
    expect(onRowsPerPageChange.mock.calls[0][0].target.value).toBe(10)
    cleanup()
    renderPage(
      <ManagementTable title="帳單" totalCount={3} tableHead={<TableHead>編號</TableHead>} pageLimit={10} pageOffset={0} onPageChange={() => {}} onRowsPerPageChange={() => {}} hidePagination>
        {body}
      </ManagementTable>
    )
    expect(screen.queryByRole('button', { name: '下一頁' })).toBeNull()
    expect(screen.queryByRole('link', { name: '報表匯出' })).toBeNull()
  })

  it('舊版 MUI 分頁文字（如果存在）改成中文「第 … 筆 共 … 筆」', () => {
    const Legacy = () => {
      const [, force] = React.useState(0)
      return (
        <>
          <button type="button" onClick={() => force(n => n + 1)}>
            重繪
          </button>
          <ManagementTable title="帳單" totalCount={3} tableHead={<TableHead>編號</TableHead>} pageLimit={10} pageOffset={0} onPageChange={() => {}} onRowsPerPageChange={() => {}}>
            <TableBody>
              <TableRow>
                <TableCell>
                  <span className="MuiTablePagination-displayedRows">1-3 of 3</span>
                </TableCell>
              </TableRow>
            </TableBody>
          </ManagementTable>
        </>
      )
    }
    renderPage(<Legacy />)
    expect(screen.getByText('1-3 of 3')).toBeInTheDocument()
  })
})

describe('TransferList 左右移轉清單', () => {
  const optionData = [
    { id: 's1', no: 'A01', name: '洗髮', price: 300, display: true },
    { id: 's2', name: '剪髮', price: 500, display: true },
    { id: 's3', name: '隱藏', price: 1, display: false },
    { id: 'c1', name: '十次卡', sellPrice: 2000, display: true },
  ]

  function Harness({ initialIds = [], onSet = () => {}, onKeyword = () => {} }) {
    const [ids, setIds] = React.useState(initialIds)
    return (
      <TransferList
        title="服務"
        optionData={optionData}
        optionIds={ids}
        idsKey="serviceIds"
        keyword=""
        keywordKey="serviceKeyword"
        keyWordsOnChange={onKeyword}
        handleSetValue={(next, key) => {
          onSet(next, key)
          setIds(next)
        }}
      />
    )
  }
  const lists = () => screen.getAllByRole('list')

  it('optionData 為 null 時不顯示', () => {
    const { container } = renderPage(<TransferList optionData={null} optionIds={[]} />)
    expect(container.querySelector('h5')).toBeNull()
  })

  it('左邊只列 display 的選項；右邊空的時候提示；勾選後加入右邊並清掉左邊勾選', () => {
    const onSet = jest.fn()
    renderPage(<Harness onSet={onSet} />)
    expect(screen.getByRole('heading', { name: '服務' })).toBeInTheDocument()
    const [left, right] = lists()
    expect(left).toHaveTextContent('A01 - 洗髮 - 300')
    expect(left).toHaveTextContent('十次卡 - 2000')
    expect(left).not.toHaveTextContent('隱藏')
    expect(right).toHaveTextContent('選取左方選項加入組合')
    const add = screen.getByRole('button', { name: '加入選取項目' })
    expect(add).toBeDisabled()
    fireEvent.click(screen.getByText('A01 - 洗髮 - 300'))
    fireEvent.click(screen.getByText('剪髮 - 500'))
    fireEvent.click(screen.getByText('剪髮 - 500'))
    fireEvent.click(screen.getByText('十次卡 - 2000'))
    fireEvent.click(add)
    expect(onSet).toHaveBeenLastCalledWith(['s1', 'c1'], 'serviceIds')
    expect(add).toBeDisabled()
    expect(lists()[1]).toHaveTextContent('A01 - 洗髮 - 300十次卡 - 2000')
  })

  it('右邊可重複加入同一項；勾選右邊項目移除（依位置，不影響另一筆同項目）；找不到資料的 id 顯示空白', () => {
    const onSet = jest.fn()
    renderPage(<Harness initialIds={['s1', 's1', 'gone']} onSet={onSet} />)
    const right = lists()[1]
    expect(right.querySelectorAll('[role="listitem"]')).toHaveLength(3)
    const remove = screen.getByRole('button', { name: '移除選取項目' })
    expect(remove).toBeDisabled()
    const rightButtons = right.querySelectorAll('button')
    fireEvent.click(rightButtons[2])
    fireEvent.click(rightButtons[0])
    fireEvent.click(rightButtons[2])
    fireEvent.click(rightButtons[2])
    fireEvent.click(remove)
    expect(onSet).toHaveBeenLastCalledWith(['s1'], 'serviceIds')
    expect(remove).toBeDisabled()
  })

  it('搜尋欄輸入帶回關鍵字欄位名稱', () => {
    const onKeyword = jest.fn()
    renderPage(<Harness onKeyword={onKeyword} />)
    fireEvent.change(screen.getByPlaceholderText('名稱/代號'), { target: { value: '洗' } })
    expect(onKeyword).toHaveBeenCalledWith('洗', 'serviceKeyword')
  })
})

describe('GoogleAnalytics／Page（依環境變數決定是否送 GA）', () => {
  const env = process.env
  afterEach(() => {
    process.env = env
    jest.resetModules()
  })

  it('沒設定 GA 量測 ID 時不載入 gtag', () => {
    jest.isolateModules(() => {
      process.env = { ...env, REACT_APP_GA_MEASUREMENT_ID: '' }
      const GoogleAnalytics = require('components/GoogleAnalytics').default
      const { container } = renderPage(<GoogleAnalytics />)
      expect(container.innerHTML).not.toContain('googletagmanager')
    })
  })

  it('有設定時以 Helmet 載入 gtag 並設定量測 ID', async () => {
    let Helmet
    jest.isolateModules(() => {
      process.env = { ...env, REACT_APP_GA_MEASUREMENT_ID: 'G-TEST' }
      Helmet = require('react-helmet').Helmet
      const GoogleAnalytics = require('components/GoogleAnalytics').default
      renderPage(<GoogleAnalytics />)
    })
    await wait(() => {
      const scripts = Helmet.peek().scriptTags
      expect(scripts.map(s => s.src).filter(Boolean)).toContain('https://www.googletagmanager.com/gtag/js?id=G-TEST')
      expect(scripts.some(s => (s.innerHTML || '').includes("gtag('config', 'G-TEST')"))).toBe(true)
    })
  })

  it('Page：設定頁面標題；非正式環境不送 GA；正式環境有 gtag 時以路徑與標題送出', async () => {
    const gtag = jest.fn()
    window.gtag = gtag
    // 模組載入時就讀環境變數：在獨立的模組表裡載入 Page 與它用的 React／路由，直接以 react-dom 渲染（避免兩份 React 混用）
    const mount = (vars, route, props, child) => {
      let out
      jest.isolateModules(() => {
        // 先以測試環境載入 React 等相依（NODE_ENV=production 會載入沒有 jsxDEV 的正式版），再切環境變數載入 Page
        const R = require('react')
        require('react/jsx-dev-runtime')
        const ReactDOM = require('react-dom')
        const { act: actIn } = require('react-dom/test-utils')
        const { MemoryRouter } = require('react-router-dom')
        require('react-router')
        const { Helmet } = require('react-helmet')
        require('prop-types')
        process.env = { ...env, ...vars }
        const Page = require('components/Page').default
        process.env = env
        const container = document.createElement('div')
        document.body.appendChild(container)
        actIn(() => {
          ReactDOM.render(R.createElement(MemoryRouter, { initialEntries: [route] }, R.createElement(Page, props, child && R.createElement('p', null, child))), container)
        })
        out = {
          container,
          Helmet,
          unmount: () => {
            ReactDOM.unmountComponentAtNode(container)
            container.remove()
          },
        }
      })
      return out
    }
    const dev = mount({ NODE_ENV: 'test' }, '/orders', { title: '帳單列表', className: 'page' }, '內容')
    expect(dev.container.querySelector('.page')).toHaveTextContent('內容')
    await wait(() => expect(dev.Helmet.peek().title).toBe('帳單列表'))
    expect(gtag).not.toHaveBeenCalled()
    dev.unmount()

    const prod = mount({ NODE_ENV: 'production', REACT_APP_GA_MEASUREMENT_ID: 'G-TEST' }, '/order/create', { title: '打帳單' })
    expect(gtag).toHaveBeenCalledWith('config', 'G-TEST', { page_path: '/order/create', page_name: '打帳單' })
    prod.unmount()

    delete window.gtag
    const noGtag = mount({ NODE_ENV: 'production' }, '/x', { title: '無 gtag' })
    expect(noGtag.container.firstChild).not.toBeNull()
    noGtag.unmount()
    await act(async () => {})
  })
})
