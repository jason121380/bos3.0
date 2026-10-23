import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { Breadcrumb, PageHeader } from '../page-header'

// 保護什麼：PageHeader 的說明、返回鈕、動作區與 Breadcrumb 的導覽語意及修飾鍵點擊。

afterEach(cleanup)

describe('PageHeader／Breadcrumb', () => {
  it('有說明時靠上對齊並顯示說明；back 畫返回鈕；children 當動作區', () => {
    const onBack = jest.fn()
    const { container } = render(
      <PageHeader title="帳單詳細" description="檢視與修改帳單" back={{ label: '返回帳單列表', onClick: onBack }}>
        <button type="button">列印</button>
      </PageHeader>
    )
    expect(container.firstChild.className).toContain('items-start')
    expect(screen.getByText('檢視與修改帳單')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '返回帳單列表' }))
    expect(onBack).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: '列印' })).toBeInTheDocument()
  })

  it('沒有說明與麵包屑時置中對齊、沒有動作區', () => {
    const { container } = render(<PageHeader title="帳單列表" />)
    expect(container.firstChild.className).toContain('items-center')
    expect(container.firstChild.children).toHaveLength(1)
  })

  it('麵包屑最後一項為目前頁；一般點擊交給 onClick，修飾鍵／中鍵點擊保留瀏覽器行為', () => {
    const onClick = jest.fn()
    render(
      <PageHeader
        title="帳單詳細"
        breadcrumb={
          <Breadcrumb
            className="bc"
            items={[
              { label: '帳單列表', href: '/management/orders', onClick },
              { label: '首頁', href: '/' },
              { label: '帳單詳細' },
            ]}
          />
        }
      />
    )
    expect(screen.getByRole('navigation', { name: '麵包屑' }).className).toContain('bc')
    expect(screen.getByText('帳單詳細', { selector: 'span' })).toHaveAttribute('aria-current', 'page')
    const link = screen.getByRole('link', { name: '帳單列表' })
    for (const mod of [{ metaKey: true }, { ctrlKey: true }, { shiftKey: true }, { button: 1 }]) {
      const ev = new MouseEvent('click', { bubbles: true, cancelable: true, ...mod })
      link.dispatchEvent(ev)
      expect(ev.defaultPrevented).toBe(false)
    }
    expect(onClick).not.toHaveBeenCalled()
    const plain = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
    link.dispatchEvent(plain)
    expect(plain.defaultPrevented).toBe(true)
    expect(onClick).toHaveBeenCalledTimes(1)
    // 沒有 onClick 的項目是一般連結
    expect(screen.getByRole('link', { name: '首頁' })).toHaveAttribute('href', '/')
    // 分隔箭頭只畫在非最後一項之後
    expect(document.querySelectorAll('nav li svg')).toHaveLength(2)
  })
})
