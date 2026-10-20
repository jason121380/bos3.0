/** @jsxImportSource @emotion/react */
// 店家樹狀選擇窗：樹狀本體改用 ui/tree-compat（與 MUI 同 DOM／class／行為；展開/勾選/搜尋/確認回傳邏輯不動），僅換 ui/dialog 殼、ui Input/Button/Checkbox 視覺與 TreeView 列高/hover/縮排覆寫
import { useState, useEffect } from 'react'
import { Button } from 'ui/button'
import { Checkbox } from 'ui/checkbox'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { Input } from 'ui/input'
import { TreeView, TreeItem } from 'ui/tree-compat'
import { ExpandMore as ExpandMoreIcon, ChevronRight as ChevronRightIcon, GroupsRounded as GroupsRoundedIcon, Storefront as StorefrontIcon, SearchRounded as SearchRoundedIcon, ClearRounded as ClearRoundedIcon } from 'ui/icons'
import PropTypes from 'prop-types'
import _, { cloneDeep } from 'lodash';
import { css } from '@emotion/react'

const styles = {
  // 樹狀本體為 ui/tree-compat（輸出 MUI 同名 class），以下覆寫統一 compact 列高、hover、縮排與箭頭對齊
  root: css({
    display: 'flex',
    gap: 2,
    flexDirection: 'column',
    '& .MuiTreeItem-content': {
      display: 'flex',
      alignItems: 'center',
      minHeight: 38,
      padding: '4px 8px',
      borderRadius: 6,
      width: 'auto',
      transition: 'background-color .15s',
      '&:hover': {
        backgroundColor: 'rgb(var(--surface-hover))'
      },
      '&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused': {
        backgroundColor: 'unset'
      }
    },
    '& .Mui-expanded, .Mui-selected': {
      backgroundColor: 'unset !important'
    },
    '& .MuiTreeItem-content .MuiTreeItem-iconContainer': {
      width: 20,
      height: 20,
      marginRight: 2,
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      '& svg': {
        width: 16,
        height: 16,
        color: 'rgb(var(--text-tertiary))'
      }
    },
    '& .MuiTreeItem-label': {
      fontSize: 14,
      lineHeight: '20px',
      paddingLeft: '2px !important'
    },
    '& li': {
      borderRadius: 6,
      width: 'auto'
    },
    '& .onSelect': {
      backgroundColor: 'rgb(var(--accent) / 0.12)',
      color: 'rgb(var(--accent))',
      fontWeight: 500,
      '& > .MuiTreeItem-content': {
        backgroundColor: 'rgb(var(--accent) / 0.12)',
        color: 'rgb(var(--accent))',
        fontWeight: 500,
        '&:hover': {
          backgroundColor: 'rgb(var(--accent) / 0.12)'
        }
      },
      '& .MuiTreeItem-label': {
        color: 'rgb(var(--accent))',
        fontWeight: 500
      },
      '& .MuiTreeItem-label svg': {
        color: 'rgb(var(--accent))'
      }
    }
  }),
  ulGroup: css({
    '& ul': {
      marginLeft: '24px !important'
    },
    '& ul .MuiCollapse-wrapper .MuiCollapse-wrapperInner': {
      display: 'flex',
      gap: '4px !important',
      flexDirection: 'row !important',
      flexWrap: 'wrap',
      marginTop: 2
    },
  }),
  ulGroupAll: css({
    '& ul': {
      marginLeft: 24
    },
    '& ul .MuiCollapse-wrapper .MuiCollapse-wrapperInner': {
      display: 'flex',
      gap: 4,
      flexDirection: 'column',
    },
  }),
  ulGroupAllMerchant: css({
    '& ul': {
      marginLeft: 24
    },
    '& ul .MuiCollapse-wrapper .MuiCollapse-wrapperInner': {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 4,
    },
  }),
  item: css({
    borderRadius: 6,
    overflow: 'hidden',
    '& .MuiTreeItem-label': {
      paddingLeft: '0px !important'
    },
    '& .MuiTreeItem-iconContainer': {
      display: 'none !important'
    }
  }),
  margin: css({
    '& > ul': {
      marginLeft: 24
    }
  }),
  span: css({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    wordBreak: 'keep-all',
    whiteSpace: 'nowrap',
    fontSize: 14,
    lineHeight: '20px',
    '& svg': {
      width: 16,
      height: 16,
      flexShrink: 0,
      color: 'rgb(var(--text-secondary))'
    }
  }),
  outline: css({
    outline: '2px solid rgb(var(--danger)) !important',
    borderRadius: 6
  })
}

const MerchantsListModal = ({ open, setOpen, merchantList, values, setValues, onValueChange }) => {
  const allNodeIds = ['ALL']
  const [expandedArr, setExpandedArr] = useState([])
  const [value, setValue] = useState('')
  const [filtIds, setFiltIds] = useState([])

  useEffect(() => {
    if (!value) {
      setFiltIds([]);
      return;
    }

    const filterMerchantsId = merchantList.allMerchants
      .filter(d => d.name.toLowerCase().includes(value.toLowerCase()))
      .map(d => d.id);

    setFiltIds(filterMerchantsId);

    if (filterMerchantsId.length > 0 && !expandedArr.includes('ALL')) {
      setExpandedArr(prevExpandedArr => [...prevExpandedArr, 'ALL']);
    }
  }, [value]);

  const renderGroup = group => {
    return group.map((data, index) => {
      allNodeIds.push(`${data.no ? data.no : ''} - ${data.name}(${data.groups.length ? data.groups.length : data.merchants.length})`)
      return (
        <div
          key={`${data.name}-${index}`}
          style={{ display: 'flex', alignItems: 'flex-start' }}
        >
          <Checkbox
            checked={isCheckedOrIndeterminat(data, 'checked?')}
            indeterminate={isCheckedOrIndeterminat(data, 'indeterminate?')}
            onChange={e => handleSelectGroup(e.target.checked, data)}
            style={{ flexShrink: 0, margin: '11px 4px 0 8px' }}
          />
          <TreeItem
            css={!(data.groups && data.groups.length) ? styles.ulGroup : styles.ulGroupAll}
            nodeId={`${data.no ? data.no : ''} - ${data.name}(${data.groups.length ? data.groups.length : data.merchants.length})`}
            label={<RenderLabel isGroup={true} data={data} />}
          >
            {data.merchants.length ? renderItem(data.merchants) : ''}
            {data.groups.length ? renderGroup(data.groups) : ''}
          </TreeItem>
        </div>
      )
    })
  }

  const renderItem = merchant => {
    return merchant.map(data => (
      <TreeItem
        key={data.id}
        onClick={() => handleItemClick(data)}
        className={isSelect(data.id)}
        css={css([styles.item, filtIds.includes(data.id) ? styles.outline : {}])}
        nodeId={data.id}
        label={<RenderLabel isGroup={false} data={data} />}
      />
    ))
  }

  const handleItemClick = data => {
    let index
    const arr = _.cloneDeep(values)
    const findData = arr.find((d, i) => {
      if (d === data.id) {
        index = i
        return true
      } else {
        return false
      }
    })
    if (findData) {
      arr.splice(index, 1)
    } else {
      arr.push(data.id)
    }
    setValues([...arr])
  }

  const RenderLabel = ({ isGroup, data }) => {
    return (
      <span
        id={isGroup ?
          `${data.no ? data.no : ''} - ${data.name}(${data.groups.length ? data.groups.length : data.merchants.length})` : data.name
        }
        css={styles.span}
      >
        {isGroup ? <GroupsRoundedIcon /> : <StorefrontIcon />}
        {isGroup ?
          `${data.no ? data.no : ''} - ${data.name}(${data.groups.length ? data.groups.length : data.merchants.length})` : data.name
        }
      </span>
    )
  }

  const isSelect = id => {
    const findData = values.find(d => d === id)
    return findData ? 'onSelect' : ''
  }

  const handleComfirm = () => {
    onValueChange(values)
    setOpen(false)
    setValues([])
    setExpandedArr([])
    setValue('')
  }

  const handleOnClose = () => {
    setValues([])
    setExpandedArr([])
    setValue('')
    setOpen(false)
  }

  const loopGroupData = data => {
    const groupMerchants = []
    const loopMerchants = Merchants => {
      groupMerchants.push(...Merchants)
    }
    const loopGroup = groups => {
      groups.forEach(d => {
        d.merchants.length && loopMerchants(d.merchants)
        d.groups.length && loopGroup(d.groups)
      })
    }
    data.merchants.length && loopMerchants(data.merchants)
    data.groups.length && loopGroup(data.groups)
    return groupMerchants
  }

  const handleSelectGroup = (checked, data) => {
    const groupMerchants = loopGroupData(data)
    const inModalValues = []
    const notInModalValues = []
    const newValue = cloneDeep(values)
    if (checked) {
      groupMerchants.forEach(d => {
        const findData = values.find(id => id === d.id)
        findData ? inModalValues.push(findData) : notInModalValues.push(d.id)
      })
      newValue.push(...notInModalValues)
    } else {
      groupMerchants.forEach(d => {
        const findIndex = newValue.indexOf(d.id)
        findIndex !== -1 && newValue.splice(findIndex, 1)
      })
    }
    setValues([...newValue])
  }

  const isCheckedOrIndeterminat = (data, type) => {
    const groupMerchants = loopGroupData(data)
    const inModalValues = []
    const notInModalValues = []
    groupMerchants.forEach(d => {
      const findData = values.find(id => id === d.id)
      findData ? inModalValues.push(d) : notInModalValues.push(d)
    })
    if (type === 'checked?') {
      return values.length > 0 && notInModalValues.length === 0
    } else {
      return inModalValues.length > 0 && inModalValues.length < groupMerchants.length
    }
  }

  const handleExpanedAll = () => {
    if (expandedArr.length === allNodeIds.length) {
      setExpandedArr([])
    } else {
      setExpandedArr(allNodeIds)
    }
  }

  const handleNodeFocus = ({ currentTarget }) => {
    const id = currentTarget.querySelector('span').id
    const index = expandedArr.indexOf(id)
    const newArr = expandedArr
    if (index === -1) {
      newArr.push(id)
    } else {
      newArr.splice(index, 1)
    }
    setExpandedArr([...newArr])
  }

  return (
    // 舊 MUI Dialog 有 onClose（點背景／Esc 走 handleOnClose 清暫存），以 onOpenChange 轉接；hideClose 保留原有關閉路徑（底部「關閉」），不另加 X
    <Dialog open={open} onOpenChange={o => { if (!o) handleOnClose() }}>
      <DialogContent size="lg" hideClose aria-describedby={undefined} className='MerchantsListModal max-w-[960px]'>
        <DialogHeader className="flex-row flex-wrap items-center gap-x-3 gap-y-2 pb-0 pr-6 max-sm:pr-4">
          <DialogTitle className="mr-auto">店家列表</DialogTitle>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 200, maxWidth: '60vw' }}>
              <SearchRoundedIcon style={{ position: 'absolute', left: 10, top: 10, width: 16, height: 16, pointerEvents: 'none', color: 'rgb(var(--text-tertiary))', zIndex: 1 }} />
              <Input
                placeholder="搜尋店家"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                style={{ paddingLeft: 32, paddingRight: value ? 36 : 12 }}
              />
              {value && (
                <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7" aria-label="清除搜尋文字" title="清除搜尋文字" onClick={() => setValue("")}><ClearRoundedIcon style={{ width: 16, height: 16 }} /></Button>
              )}
            </div>
            <Button size="sm" variant="ghost" className="border border-solid border-border-strong" onClick={() => setValues([])}>清除選取</Button>
            <Button size="sm" variant="ghost" className="border border-solid border-border-strong" onClick={handleExpanedAll}>展開全部</Button>
          </div>
        </DialogHeader>
        <DialogBody className="py-3">
        <TreeView
          css={styles.root}
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          expanded={expandedArr}
          onNodeToggle={handleNodeFocus}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <Checkbox
              checked={values.length > 0 && values.length === merchantList.allMerchants.length}
              indeterminate={values.length > 0 && values.length < merchantList.allMerchants.length}
              onChange={e => e.target.checked ? setValues(merchantList.allMerchants.map(d => d.id)) : setValues([])}
              style={{ flexShrink: 0, margin: '11px 4px 0 8px' }}
            />
            <TreeItem
              css={styles.ulGroupAllMerchant}
              style={{ overflow: 'visible' }}
              nodeId='ALL'
              label={
                <span id='ALL' css={styles.span}>
                  <GroupsRoundedIcon />{`全部(${merchantList.allMerchants.length})`}
                </span>
              }
            >
              {merchantList.allMerchants.length ? renderItem(merchantList.allMerchants) : ''}
            </TreeItem>
          </div>
          {merchantList.groups.length ? renderGroup(merchantList.groups) : ''}
          {merchantList.merchants.length ? renderItem(merchantList.merchants) : ''}
        </TreeView>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={handleOnClose}>關閉</Button>
          <Button variant="primary" onClick={handleComfirm}>確認</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

MerchantsListModal.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  merchantList: PropTypes.object,
  values: PropTypes.array,
  setValues: PropTypes.func
}

export default MerchantsListModal