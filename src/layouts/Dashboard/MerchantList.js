import { ExpandMore as ExpandMoreIcon, ChevronRight as ChevronRightIcon, GroupsRounded as GroupsRoundedIcon, Storefront as StorefrontIcon } from 'ui/icons'
import { useHistory } from 'react-router';

import React, { useState, useEffect, useRef } from 'react'

// 群組標籤「代號 - 名稱(數量)」：數量為子群組數，沒有子群組時為店家數；缺欄位視為空（Jason 2026/10/22 fix all，原本缺 groups 會拋錯、TopBar 跟著壞掉）
const groupLabel = data => {
  const groupCount = (data.groups || []).length
  return `${data.no ? data.no : ''} - ${data.name}(${groupCount || (data.merchants || []).length})`
}

const MerchantList = ({ merchants, searchQuery }) => {
  const history = useHistory()
  const [expanded, setExpanded] = useState([])
  const [focusedKey, setFocusedKey] = useState(null)
  const itemRefs = useRef({})
  const typeAheadRef = useRef({ buffer: '', time: 0 })
  // 可捲動清單裡的按鈕：iOS 第一次輕點常常只聚焦並套上 hover，click 被取消。觸控改在 pointerup 選取。
  const touchPressRef = useRef(null)
  const suppressClickRef = useRef(null)
  const suppressTimerRef = useRef(null)
  const swallowClickRef = useRef(null)

  useEffect(() => () => {
    clearTimeout(suppressTimerRef.current)
    if (swallowClickRef.current) window.removeEventListener('click', swallowClickRef.current, true)
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const allIds = []
      const collectIds = (groups) => {
        groups.forEach((g, i) => {
          allIds.push(`group-${g.name}-${i}`)
          if (g.groups) collectIds(g.groups)
        })
      }
      collectIds(merchants.groups)
      allIds.push('全部')
      setExpanded(allIds)
    } else {
      setExpanded([])
    }
  }, [searchQuery, merchants.groups])

  const handleItemClick = merchant => {
    localStorage.setItem('userMerchant', JSON.stringify({ id: merchant.id, name: merchant.name }))
    history.push('/order/create')
    window.location.reload()
  }

  const toggleNode = id => {
    setExpanded(prev => prev.includes(id) ? prev.filter(nodeId => nodeId !== id) : [...prev, id])
  }

  const armSuppressClick = key => {
    suppressClickRef.current = key
    if (swallowClickRef.current) window.removeEventListener('click', swallowClickRef.current, true)
    clearTimeout(suppressTimerRef.current)
    const swallow = event => {
      event.preventDefault()
      event.stopPropagation()
      window.removeEventListener('click', swallow, true)
      if (swallowClickRef.current === swallow) swallowClickRef.current = null
    }
    swallowClickRef.current = swallow
    window.addEventListener('click', swallow, true)
    suppressTimerRef.current = setTimeout(() => {
      window.removeEventListener('click', swallow, true)
      if (swallowClickRef.current === swallow) swallowClickRef.current = null
      if (suppressClickRef.current === key) suppressClickRef.current = null
    }, 500)
  }

  const activateNode = node => {
    setFocusedKey(node.key)
    if (node.isGroup) {
      if (node.children.length) toggleNode(node.id)
    } else {
      handleItemClick(node.data)
    }
  }

  // 圖示 16px 用 inline style：ui/icons 的預設 font-size 由執行期插入的樣式給定（晚於 Tailwind）；
  // inline 同樣會輸給列印的 html * { font-size: 9px !important }（用 ! 會連列印一起蓋掉）
  const RenderLabel = ({ isGroup, labelText }) => {
    return (
      <span className="flex min-w-0 flex-1 items-center gap-[12px] text-[14px] font-normal text-text">
        {isGroup ? <GroupsRoundedIcon className="shrink-0 text-text-secondary" style={{ fontSize: '16px' }} /> : <StorefrontIcon className="shrink-0 text-text-secondary" style={{ fontSize: '16px' }} />}
        <span className="min-w-0 whitespace-nowrap max-sm:truncate">{labelText}</span>
      </span>
    )
  }

  // 節點 id 規則與原 MUI TreeView 完全相同（group-${name}-${index}／全部／店家 id），搜尋自動展開的 id 集合才能原樣套用
  // key 另以完整路徑組裝：同一店家會同時出現在「全部」與所屬群組下，原 MUI nodeId 雖重複，焦點 ref 不能互相覆蓋
  const buildMerchantNode = (data, parentKey) => ({
    key: `${parentKey || 'root'}-merchant-${data.id}`,
    id: data.id,
    isGroup: false,
    data,
    parentKey,
    labelText: data.name,
    children: []
  })

  const buildGroupNode = (data, index, parentKey) => {
    const id = `group-${data.name}-${index}`
    const key = `${parentKey || 'root'}-${id}`
    const children = [
      ...(data.merchants || []).map(merchant => buildMerchantNode(merchant, key)),
      ...(data.groups || []).map((subGroup, subIndex) => buildGroupNode(subGroup, subIndex, key))
    ]
    return {
      key,
      id,
      isGroup: true,
      data,
      parentKey,
      labelText: groupLabel(data),
      children
    }
  }

  const allNode = {
    key: '全部',
    id: '全部',
    isGroup: true,
    isAll: true,
    data: merchants,
    parentKey: null,
    labelText: `全部(${(merchants.allMerchants || []).length})`,
    children: (merchants.allMerchants || []).map(merchant => buildMerchantNode(merchant, '全部'))
  }

  const rootNodes = [
    allNode,
    ...(merchants.groups || []).map((group, index) => buildGroupNode(group, index, null)),
    ...(merchants.merchants || []).map(merchant => buildMerchantNode(merchant, null))
  ]

  // 目前畫面上看得到的節點（依展開狀態攤平），鍵盤上下移動以此清單為準，與原 MUI TreeView 的可見節點導覽相同
  const visibleNodes = []
  const collectVisible = nodes => {
    nodes.forEach(node => {
      visibleNodes.push(node)
      if (node.isGroup && expanded.includes(node.id)) collectVisible(node.children)
    })
  }
  collectVisible(rootNodes)

  const effectiveFocusedKey = visibleNodes.some(node => node.key === focusedKey)
    ? focusedKey
    : (visibleNodes[0] ? visibleNodes[0].key : null)

  const focusNode = key => {
    setFocusedKey(key)
    // 展開後子節點才會出現在畫面上，用 rAF 等 render 完成再移焦點
    requestAnimationFrame(() => {
      if (itemRefs.current[key]) itemRefs.current[key].focus()
    })
  }

  const handleKeyDown = (event, node) => {
    const index = visibleNodes.findIndex(visible => visible.key === node.key)
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const nextIndex = event.key === 'ArrowDown'
        ? Math.min(index + 1, visibleNodes.length - 1)
        : Math.max(index - 1, 0)
      if (visibleNodes[nextIndex]) focusNode(visibleNodes[nextIndex].key)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      if (node.isGroup && node.children.length) {
        if (!expanded.includes(node.id)) toggleNode(node.id)
        else if (node.children[0]) focusNode(node.children[0].key)
      }
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      if (node.isGroup && node.children.length && expanded.includes(node.id)) {
        toggleNode(node.id)
      } else if (node.parentKey) {
        const parent = visibleNodes.find(visible => visible.key === node.parentKey)
        if (parent) focusNode(parent.key)
      }
    } else if (event.key === 'Home') {
      event.preventDefault()
      if (visibleNodes[0]) focusNode(visibleNodes[0].key)
    } else if (event.key === 'End') {
      event.preventDefault()
      const last = visibleNodes[visibleNodes.length - 1]
      if (last) focusNode(last.key)
    } else if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      // 原 MUI TreeView 的打字搜尋（type-ahead）：連續輸入字首跳到下一個符合的可見節點，800ms 未輸入即重置
      const now = Date.now()
      const buffer = now - typeAheadRef.current.time > 800 ? event.key : typeAheadRef.current.buffer + event.key
      typeAheadRef.current = { buffer, time: now }
      const query = buffer.toLowerCase()
      const ordered = [...visibleNodes.slice(index + 1), ...visibleNodes.slice(0, index + 1)]
      const match = ordered.find(visible => String(visible.labelText).toLowerCase().startsWith(query))
      if (match) focusNode(match.key)
    }
  }

  const renderNode = (node, depth) => {
    const hasChildren = node.children.length > 0
    const isExpanded = node.isGroup && expanded.includes(node.id)
    return (
      <li
        key={node.key}
        role="treeitem"
        aria-expanded={node.isGroup && hasChildren ? isExpanded : undefined}
        aria-selected={false}
      >
        <button
          type="button"
          ref={el => { itemRefs.current[node.key] = el }}
          tabIndex={node.key === effectiveFocusedKey ? 0 : -1}
          title={node.labelText}
          className={`flex min-w-0 items-center w-full overflow-hidden py-[8px] [border:none] rounded-[8px] bg-transparent cursor-pointer text-left [font:inherit] [transition:.2s] hover:bg-surface-hover focus-visible:[outline:2px_solid_rgb(var(--accent))] focus-visible:[outline-offset:-2px] ${(node.isGroup || depth > 0) ? 'pl-[24px] pr-[16px]' : 'px-[16px]'}`}
          onPointerDown={event => {
            if (event.pointerType === 'mouse') return
            touchPressRef.current = { key: node.key, x: event.clientX, y: event.clientY }
          }}
          onPointerUp={event => {
            const press = touchPressRef.current
            touchPressRef.current = null
            if (event.pointerType === 'mouse' || !press || press.key !== node.key) return
            const moved = Math.abs(event.clientX - press.x) > 10 || Math.abs(event.clientY - press.y) > 10
            armSuppressClick(node.key)
            if (!moved) activateNode(node)
          }}
          onPointerCancel={() => { touchPressRef.current = null }}
          onClick={() => {
            if (suppressClickRef.current === node.key) {
              suppressClickRef.current = null
              clearTimeout(suppressTimerRef.current)
              return
            }
            activateNode(node)
          }}
          onFocus={() => setFocusedKey(node.key)}
          onKeyDown={event => handleKeyDown(event, node)}
        >
          {node.isGroup && hasChildren
            ? (isExpanded
              ? <ExpandMoreIcon className="shrink-0 text-text-tertiary" sx={{ color: 'rgb(var(--text-tertiary))' }} />
              : <ChevronRightIcon className="shrink-0 text-text-tertiary" sx={{ color: 'rgb(var(--text-tertiary))' }} />)
            : null}
          {node.isAll ? (
            <span className="flex min-w-0 flex-1 items-center gap-[12px] text-[14px] font-normal text-text">
              <GroupsRoundedIcon className="shrink-0 text-text-secondary" style={{ fontSize: '16px' }} />
              <span className="min-w-0 whitespace-nowrap max-sm:truncate">{node.labelText}</span>
            </span>
          ) : (
            <RenderLabel isGroup={node.isGroup} labelText={node.labelText} />
          )}
        </button>
        {node.isGroup && hasChildren && isExpanded ? (
          <ul role="group" className="!ml-[12px] [border-left:1px_solid_rgb(var(--border))]">
            {node.children.map(child => renderNode(child, depth + 1))}
          </ul>
        ) : null}
      </li>
    )
  }

  return (
    <ul className="flex gap-0 flex-col list-none m-0 p-0 [&_ul]:list-none [&_ul]:m-0 [&_ul]:p-0" role="tree" aria-label="店家列表">
      {rootNodes.map(node => renderNode(node, 0))}
    </ul>
  )
}

export default MerchantList
