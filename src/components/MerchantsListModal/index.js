// 店家樹狀選擇窗：使用 ui/tree，展開／勾選／搜尋／確認回傳邏輯保留。
import { useState, useEffect } from 'react'
import { Button } from 'ui/button'
import { Checkbox } from 'ui/checkbox'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { Input } from 'ui/input'
import { TreeView, TreeItem } from 'ui/tree'
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  GroupsRounded as GroupsRoundedIcon,
  Storefront as StorefrontIcon,
  SearchRounded as SearchRoundedIcon,
  ClearRounded as ClearRoundedIcon,
} from 'ui/icons'
import PropTypes from 'prop-types'
import cloneDeep from 'lodash/cloneDeep'

// 列高、hover 與選取色由 ui/tree 提供；此處只定義群組排列與搜尋框線。
export const defaultTreeClasses = {
  root: 'gap-0.5',
  ulGroup: 'flex-row flex-wrap gap-1',
  ulGroupAll: 'flex-col gap-1',
  ulGroupAllMerchant: 'flex-row flex-wrap gap-1',
  item: 'rounded-md',
  outline: 'outline outline-2 outline-danger rounded-md',
  span: 'flex items-center gap-1.5 whitespace-nowrap text-[14px] leading-5 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0',
}
export const managementTreeClasses = { ...defaultTreeClasses }

const MerchantsListModal = ({ open, setOpen, merchantList, values, setValues, classes = defaultTreeClasses }) => {
  const allNodeIds = ['ALL']
  const [modalValues, setModalValues] = useState(values)
  const [expandedArr, setExpandedArr] = useState([])
  const [value, setValue] = useState('')
  const [filtIds, setFiltIds] = useState([])

  useEffect(() => {
    if (open) {
      open && setModalValues(values)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [open] 變動時執行；values 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [open])

  useEffect(() => {
    if (!value) {
      setFiltIds([])
      return
    }
    const filterMerchantsId = merchantList.allMerchants.filter(d => d.name.toLowerCase().includes(value.toLowerCase())).map(d => d.id)
    setFiltIds(filterMerchantsId)
    if (filterMerchantsId.length > 0 && !expandedArr.includes('ALL')) {
      setExpandedArr(prevExpandedArr => [...prevExpandedArr, 'ALL'])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [value] 變動時執行；expandedArr、merchantList.allMerchants 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [value])

  const renderGroup = group => {
    return group.map((data, index) => {
      allNodeIds.push(`${data.no ? data.no : ''} - ${data.name}(${(data.groups?.length ?? 0) ? data.groups.length : data.merchants.length})`)
      return (
        <div key={`${data.name}-${index}`} style={{ display: 'flex', alignItems: 'flex-start' }}>
          <Checkbox
            checked={isCheckedOrIndeterminate(data, 'checked?')}
            indeterminate={isCheckedOrIndeterminate(data, 'indeterminate?')}
            onChange={e => handleSelectGroup(e.target.checked, data)}
            style={{ flexShrink: 0, margin: '11px 4px 0 8px' }}
          />
          <TreeItem
            groupClassName={!(data.groups && data.groups.length) ? classes.ulGroup : classes.ulGroupAll}
            nodeId={`${data.no ? data.no : ''} - ${data.name}(${(data.groups?.length ?? 0) ? data.groups.length : data.merchants.length})`}
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
        className={`${isSelect(data.id)} ${classes.item}${filtIds.includes(data.id) ? ` ${classes.outline}` : ''}`}
        selected={!!isSelect(data.id)}
        nodeId={data.id}
        label={<RenderLabel isGroup={false} data={data} />}
      />
    ))
  }

  const handleItemClick = data => {
    let index
    const arr = cloneDeep(modalValues)
    const findData = arr.find((d, i) => {
      if (d.id === data.id) {
        index = i
        return true
      } else {
        return false
      }
    })
    if (findData) {
      arr.splice(index, 1)
    } else {
      arr.push(data)
    }
    setModalValues([...arr])
  }

  const RenderLabel = ({ isGroup, data }) => {
    return (
      <span
        id={
          isGroup ? `${data.no ? data.no : ''} - ${data.name}(${(data.groups?.length ?? 0) ? data.groups.length : data.merchants.length})` : data.name
        }
        className={classes.span}
      >
        {isGroup ? <GroupsRoundedIcon /> : <StorefrontIcon />}
        {isGroup ? `${data.no ? data.no : ''} - ${data.name}(${(data.groups?.length ?? 0) ? data.groups.length : data.merchants.length})` : data.name}
      </span>
    )
  }

  const isSelect = id => {
    const findData = modalValues.find(d => d.id === id)
    return findData ? 'onSelect' : ''
  }

  const handleConfirm = () => {
    const values = cloneDeep(modalValues)
    setValues(values)
    setModalValues([])
    setExpandedArr([])
    setValue('')
    setOpen(false)
  }

  const handleOnClose = () => {
    setModalValues([])
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
    const newValue = modalValues
    if (checked) {
      groupMerchants.forEach(d => {
        const findData = modalValues.find(data => data.id === d.id)
        findData ? inModalValues.push(d) : notInModalValues.push(d)
      })
      newValue.push(...notInModalValues)
    } else {
      groupMerchants.forEach(d => {
        let index
        const findData = modalValues.find((data, i) => {
          if (d.id === data.id) {
            index = i
            return true
          } else {
            return false
          }
        })
        if (findData) {
          newValue.splice(index, 1)
        }
      })
    }
    setModalValues([...newValue])
  }

  const isCheckedOrIndeterminate = (data, type) => {
    const groupMerchants = loopGroupData(data)
    const inModalValues = []
    const notInModalValues = []
    groupMerchants.forEach(d => {
      const findData = modalValues.find(data => data.id === d.id)
      findData ? inModalValues.push(d) : notInModalValues.push(d)
    })
    if (type === 'checked?') {
      return modalValues.length > 0 && notInModalValues.length === 0
    } else {
      return inModalValues.length > 0 && inModalValues.length < groupMerchants.length
    }
  }

  const handleExpandedAll = () => {
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
    <Dialog
      open={open}
      onOpenChange={o => {
        if (!o) handleOnClose()
      }}
    >
      <DialogContent size="lg" hideClose aria-describedby={undefined} className="MerchantsListModal max-w-[960px]">
        <DialogHeader className="flex-row flex-wrap items-center gap-x-3 gap-y-2 pb-0 pr-6 max-sm:pr-4">
          <DialogTitle className="mr-auto">店家列表</DialogTitle>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 200, maxWidth: '60vw' }}>
              <SearchRoundedIcon
                style={{
                  position: 'absolute',
                  left: 10,
                  top: 10,
                  width: 16,
                  height: 16,
                  pointerEvents: 'none',
                  color: 'rgb(var(--text-tertiary))',
                  zIndex: 1,
                }}
              />
              <Input
                placeholder="搜尋店家"
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
                style={{ paddingLeft: 32, paddingRight: value ? 36 : 12 }}
              />
              {value && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-7 w-7"
                  aria-label="清除搜尋文字"
                  title="清除搜尋文字"
                  onClick={() => setValue('')}
                >
                  <ClearRoundedIcon style={{ width: 16, height: 16 }} />
                </Button>
              )}
            </div>
            <Button size="sm" variant="ghost" className="border border-solid border-border-strong" onClick={() => setModalValues([])}>
              清除選取
            </Button>
            <Button size="sm" variant="ghost" className="border border-solid border-border-strong" onClick={handleExpandedAll}>
              展開全部
            </Button>
          </div>
        </DialogHeader>
        <DialogBody className="py-3">
          <TreeView
            aria-label="店家列表"
            aria-multiselectable="true"
            className={classes.root}
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            selected={null}
            expanded={expandedArr}
            onToggle={handleNodeFocus}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <Checkbox
                checked={modalValues.length > 0 && modalValues.length === merchantList.allMerchants.length}
                indeterminate={modalValues.length > 0 && modalValues.length < merchantList.allMerchants.length}
                onChange={e => (e.target.checked ? setModalValues(merchantList.allMerchants) : setModalValues([]))}
                style={{ flexShrink: 0, margin: '11px 4px 0 8px' }}
              />
              <TreeItem
                groupClassName={classes.ulGroupAllMerchant}
                style={{ overflow: 'visible' }}
                nodeId="ALL"
                label={
                  <span id="ALL" className={classes.span}>
                    <GroupsRoundedIcon />
                    {`全部(${merchantList.allMerchants.length})`}
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
          <Button variant="secondary" onClick={handleOnClose}>
            關閉
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            確認
          </Button>
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
  setValues: PropTypes.func,
  // 樹狀樣式（class 字串組）：預設 defaultTreeClasses；MerchantListAutocompleteForManagement 傳 managementTreeClasses
  classes: PropTypes.object,
}

export default MerchantsListModal
