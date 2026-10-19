/** @jsxImportSource @emotion/react */
import { ExpandMore as ExpandMoreIcon, ChevronRight as ChevronRightIcon, GroupsRounded as GroupsRoundedIcon, Storefront as StorefrontIcon } from 'ui/icons'
import { useHistory } from 'react-router';
import { css } from '@emotion/react'

import React, { useState, useEffect, useRef } from 'react'

const styles = {
  tree: css({
    display: 'flex',
    gap: 0,
    flexDirection: 'column',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    '& ul': {
      listStyle: 'none',
      margin: 0,
      padding: 0
    }
  }),
  row: css({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '8px 16px',
    border: 'none',
    borderRadius: 8,
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    font: 'inherit',
    transition: '.2s',
    '&:hover': {
      background: 'rgb(var(--surface-hover))'
    },
    '&:focus-visible': {
      outline: '2px solid rgb(var(--accent))',
      outlineOffset: '-2px'
    }
  }),
  rowIndented: css({
    paddingLeft: '24px'
  }),
  children: css({
    marginLeft: '12px !important',
    borderLeft: '1px solid rgb(var(--border))'
  }),
  span: css({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    wordBreak: 'keep-all',
    whiteSpace: 'nowrap',
    fontSize: '14px',
    fontWeight: 400,
    color: 'rgb(var(--text))'
  }),
  icon: css({
    color: 'rgb(var(--text-secondary))',
    fontSize: '16px'
  }),
  expandIcon: css({
    flexShrink: 0,
    color: 'rgb(var(--text-tertiary))'
  })
}

const MerchantList = ({ merchants, searchQuery }) => {
  const history = useHistory()
  const [expanded, setExpanded] = useState([])
  const [focusedKey, setFocusedKey] = useState(null)
  const itemRefs = useRef({})
  const typeAheadRef = useRef({ buffer: '', time: 0 })

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

  const RenderLabel = ({ isGroup, data }) => {
    return (
      <span css={styles.span}>
        {isGroup ? <GroupsRoundedIcon css={styles.icon} /> : <StorefrontIcon css={styles.icon} />}
        {isGroup ?
          `${data.no ? data.no : ''} - ${data.name}(${data.groups.length ? data.groups.length : data.merchants.length})` : data.name
        }
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
      labelText: `${data.no ? data.no : ''} - ${data.name}(${data.groups.length ? data.groups.length : data.merchants.length})`,
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
    labelText: `全部(${merchants.allMerchants.length})`,
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
          css={[styles.row, (node.isGroup || depth > 0) ? styles.rowIndented : null]}
          onClick={() => {
            setFocusedKey(node.key)
            if (node.isGroup) {
              if (hasChildren) toggleNode(node.id)
            } else {
              handleItemClick(node.data)
            }
          }}
          onFocus={() => setFocusedKey(node.key)}
          onKeyDown={event => handleKeyDown(event, node)}
        >
          {node.isGroup && hasChildren
            ? (isExpanded
              ? <ExpandMoreIcon css={styles.expandIcon} sx={{ color: 'rgb(var(--text-tertiary))' }} />
              : <ChevronRightIcon css={styles.expandIcon} sx={{ color: 'rgb(var(--text-tertiary))' }} />)
            : null}
          {node.isAll ? (
            <span css={styles.span}>
              <GroupsRoundedIcon css={styles.icon} />{`全部(${merchants.allMerchants.length})`}
            </span>
          ) : (
            <RenderLabel isGroup={node.isGroup} data={node.data} />
          )}
        </button>
        {node.isGroup && hasChildren && isExpanded ? (
          <ul role="group" css={styles.children}>
            {node.children.map(child => renderNode(child, depth + 1))}
          </ul>
        ) : null}
      </li>
    )
  }

  return (
    <ul css={styles.tree} role="tree" aria-label="店家列表">
      {rootNodes.map(node => renderNode(node, 0))}
    </ul>
  )
}

export default MerchantList
