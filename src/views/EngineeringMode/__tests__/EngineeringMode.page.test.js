// 工程模式頁：非高階主管直接開網址會被送回個人頁；高階主管未解鎖只看密碼閘；
// 密碼正確才看得到 PASS/FAIL。不連真實後端。
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { renderPage, loginAs, currentLocation } from '../../../__tests__/testkit.test'
import { APP_VERSION } from '../../../version'
import { ENGINEERING_UNLOCK_KEY, clearEngineeringUnlock } from 'helper/engineeringMode'
import EngineeringMode from '..'

jest.setTimeout(20000)

const identity = authorityName => ({
  FETCH_PROFILE_IDENDITY: {
    me: { id: 'user-1', merchantIdentity: { authorityName, authorityId: 'auth-1' } },
  },
})

const renderEngineering = fixtures =>
  renderPage(<EngineeringMode />, {
    fixtures,
    route: '/engineering',
  })

beforeEach(() => {
  clearEngineeringUnlock()
  sessionStorage.clear()
  loginAs({ merchant: { id: 'm-1', name: '測試店' }, user: { id: 'user-1', name: '店長小林' } })
  localStorage.setItem('token', 'secret-token-value')
})

afterEach(cleanup)

describe('路由守衛', () => {
  it('非高階主管直接開啟網址時導回個人頁，不顯示密碼與內容', async () => {
    renderEngineering(identity('設計師'))
    await wait(() => expect(currentLocation()).toBe('/profile/general'))
    expect(screen.queryByLabelText('工程密碼')).toBeNull()
    expect(screen.queryByText('應用程式版號')).toBeNull()
    expect(screen.queryByText('PASS')).toBeNull()
    expect(screen.queryByText('FAIL')).toBeNull()
  })

  it('角色查詢失敗時同樣不顯示工程內容', async () => {
    renderEngineering({ FETCH_PROFILE_IDENDITY: new Error('down') })
    await wait(() => expect(currentLocation()).toBe('/profile/general'))
    expect(screen.queryByLabelText('工程密碼')).toBeNull()
    expect(screen.queryByText('應用程式版號')).toBeNull()
  })
})

describe('密碼閘', () => {
  it('高階主管未解鎖只看得到密碼閘，錯誤密碼不顯示內容', async () => {
    renderEngineering(identity('高階主管'))
    const input = await screen.findByLabelText('工程密碼')
    expect(screen.queryByText('應用程式版號')).toBeNull()
    expect(screen.queryByText('PASS')).toBeNull()

    fireEvent.change(input, { target: { value: '9999' } })
    fireEvent.click(screen.getByRole('button', { name: '進入' }))

    expect(await screen.findByText('密碼不正確')).toBeInTheDocument()
    expect(screen.queryByText('應用程式版號')).toBeNull()
    expect(screen.queryByText('secret-token-value')).toBeNull()
    expect(sessionStorage.getItem(ENGINEERING_UNLOCK_KEY)).toBeNull()
    expect(currentLocation()).toBe('/engineering')
  })

  it('正確密碼後顯示 PASS，且畫面與 sessionStorage 都沒有密碼或權杖', async () => {
    renderEngineering(identity('高階主管'))
    fireEvent.change(await screen.findByLabelText('工程密碼'), { target: { value: '0000' } })
    fireEvent.click(screen.getByRole('button', { name: '進入' }))

    expect(await screen.findByText('應用程式版號')).toBeInTheDocument()
    expect(screen.getByTestId('engineering-check-version')).toHaveAttribute('data-status', 'pass')
    expect(screen.getByTestId('engineering-check-version')).toHaveTextContent(APP_VERSION)
    expect(screen.getByTestId('engineering-check-graphql')).toHaveAttribute('data-status', 'pass')
    expect(screen.getByTestId('engineering-check-session')).toHaveTextContent('測試店')
    expect(screen.getByTestId('engineering-check-session')).toHaveTextContent('高階主管')
    expect(screen.getByTestId('engineering-check-session')).toHaveTextContent('店長小林')
    expect(screen.getByTestId('engineering-check-diagnostics')).toHaveTextContent('token 有')
    expect(screen.getByRole('link', { name: '版本更新紀錄' })).toHaveAttribute('href', '/system-update-record')
    expect(screen.queryByLabelText('工程密碼')).toBeNull()
    expect(document.body.textContent).not.toContain('secret-token-value')
    expect(document.body.textContent).not.toContain('0000')
    expect(sessionStorage.getItem(ENGINEERING_UNLOCK_KEY)).toBe('1')
  })

  it('這個分頁已解鎖時，深連結直接看到內容', async () => {
    sessionStorage.setItem(ENGINEERING_UNLOCK_KEY, '1')
    renderEngineering(identity('高階主管'))
    expect(await screen.findByText('應用程式版號')).toBeInTheDocument()
    expect(screen.queryByLabelText('工程密碼')).toBeNull()
    expect(screen.getByTestId('engineering-check-graphql')).toHaveAttribute('data-status', 'pass')
  })

  it('已解鎖後重新檢查失敗會顯示 FAIL，仍留在工程模式', async () => {
    let calls = 0
    renderEngineering({
      FETCH_PROFILE_IDENDITY: () => {
        calls += 1
        if (calls > 1) return new Error('down')
        return { me: { id: 'user-1', merchantIdentity: { authorityName: '高階主管', authorityId: 'auth-1' } } }
      },
    })
    fireEvent.change(await screen.findByLabelText('工程密碼'), { target: { value: '0000' } })
    fireEvent.click(screen.getByRole('button', { name: '進入' }))
    expect(await screen.findByTestId('engineering-check-graphql')).toHaveAttribute('data-status', 'pass')

    fireEvent.click(screen.getByRole('button', { name: '重新檢查' }))
    await wait(() => expect(screen.getByTestId('engineering-check-graphql')).toHaveAttribute('data-status', 'fail'))
    expect(screen.getByTestId('engineering-check-graphql')).toHaveTextContent('FAIL')
    expect(screen.getByText('應用程式版號')).toBeInTheDocument()
    expect(currentLocation()).toBe('/engineering')
    expect(document.body.textContent).not.toContain('secret-token-value')
  })
})
