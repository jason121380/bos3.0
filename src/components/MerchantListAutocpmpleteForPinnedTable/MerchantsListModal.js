// 店家樹狀選擇窗：樹狀本體改用 ui/tree-compat（與 MUI 同 DOM／class／行為；展開/勾選/搜尋/確認回傳邏輯不動），僅換 ui/dialog 殼、ui Input/Button/Checkbox 視覺與 TreeView 列高/hover/縮排覆寫
import { useState, useEffect } from 'react'
import { Button } from 'ui/button'
import { Checkbox } from 'ui/checkbox'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { Input } from 'ui/input'
import { TreeView, TreeItem } from 'ui/tree-compat'
import { ExpandMore as ExpandMoreIcon, ChevronRight as ChevronRightIcon, GroupsRounded as GroupsRoundedIcon, Storefront as StorefrontIcon, SearchRounded as SearchRoundedIcon, ClearRounded as ClearRoundedIcon } from 'ui/icons'
import PropTypes from 'prop-types'
import cloneDeep from 'lodash/cloneDeep';

// 樹狀本體為 ui/tree-compat（輸出 MUI 同名 class），以下覆寫統一 compact 列高、hover、縮排與箭頭對齊（原 emotion styles 等值轉 Tailwind）。
// 權重說明：tree-compat.css 在路由 chunk（晚於 emotion 與 Tailwind 載入），同權重時兩者皆輸給它，故不加 !；
// 原本同為 (0,3,0) 的 hover → focused／selected 取消底色 → 已選店家底色三條規則靠 emotion 插入順序決定勝負，Tailwind 任意變體的輸出順序不固定，
// 改以 :where＋元素選擇器把前兩條排成 (0,2,1) < (0,2,2) < (0,3,0)：仍高於 tree-compat 的 (0,2,0)、仍輸給其 (0,3,0)（如深色 focused），勝負與原本相同；
// 店家 label 內距（item 的 !important 蓋 root 的 !important）以 && 提高權重保留原本順序。
const treeClass = [
  'flex gap-[2px] flex-col',
  '[&_.MuiTreeItem-content]:flex [&_.MuiTreeItem-content]:items-center [&_.MuiTreeItem-content]:min-h-[38px] [&_.MuiTreeItem-content]:px-[8px] [&_.MuiTreeItem-content]:py-[4px]',
  '[&_.MuiTreeItem-content]:rounded-[6px] [&_.MuiTreeItem-content]:w-auto [&_.MuiTreeItem-content]:[transition:background-color_.15s]',
  '[&_div:where(.MuiTreeItem-content):hover]:bg-surface-hover',
  '[&_li>div:where(.MuiTreeItem-content).Mui-focused]:[background-color:unset] [&_li>div:where(.MuiTreeItem-content).Mui-selected]:[background-color:unset]',
  '[&_.MuiTreeItem-content.Mui-selected.Mui-focused]:[background-color:unset]',
  '[&_.Mui-expanded]:![background-color:unset] [&_.Mui-selected]:![background-color:unset]',
  '[&_.MuiTreeItem-content_.MuiTreeItem-iconContainer]:w-[20px] [&_.MuiTreeItem-content_.MuiTreeItem-iconContainer]:h-[20px] [&_.MuiTreeItem-content_.MuiTreeItem-iconContainer]:mr-[2px] [&_.MuiTreeItem-content_.MuiTreeItem-iconContainer]:p-0',
  '[&_.MuiTreeItem-content_.MuiTreeItem-iconContainer]:flex [&_.MuiTreeItem-content_.MuiTreeItem-iconContainer]:items-center [&_.MuiTreeItem-content_.MuiTreeItem-iconContainer]:justify-center [&_.MuiTreeItem-content_.MuiTreeItem-iconContainer]:shrink-0',
  '[&_.MuiTreeItem-content_.MuiTreeItem-iconContainer_svg]:w-[16px] [&_.MuiTreeItem-content_.MuiTreeItem-iconContainer_svg]:h-[16px] [&_.MuiTreeItem-content_.MuiTreeItem-iconContainer_svg]:text-text-tertiary',
  '[&_.MuiTreeItem-label]:text-[14px] [&_.MuiTreeItem-label]:leading-[20px] [&_.MuiTreeItem-label]:!pl-[2px]',
  '[&_li]:rounded-[6px] [&_li]:w-auto',
  '[&_.onSelect]:bg-[rgb(var(--accent)/0.12)] [&_.onSelect]:text-accent [&_.onSelect]:font-medium',
  '[&_.onSelect>.MuiTreeItem-content]:bg-[rgb(var(--accent)/0.12)] [&_.onSelect>.MuiTreeItem-content]:text-accent [&_.onSelect>.MuiTreeItem-content]:font-medium',
  '[&_.onSelect>.MuiTreeItem-content:hover]:bg-[rgb(var(--accent)/0.12)]',
  '[&_.onSelect_.MuiTreeItem-label]:text-accent [&_.onSelect_.MuiTreeItem-label]:font-medium [&_.onSelect_.MuiTreeItem-label_svg]:text-accent',
].join(' ')
// 群組（無子群組）：子店家橫向排列
const ulGroupClass = '[&_ul]:!ml-[24px] [&_ul_.MuiCollapse-wrapper_.MuiCollapse-wrapperInner]:flex [&_ul_.MuiCollapse-wrapper_.MuiCollapse-wrapperInner]:!gap-[4px] [&_ul_.MuiCollapse-wrapper_.MuiCollapse-wrapperInner]:!flex-row [&_ul_.MuiCollapse-wrapper_.MuiCollapse-wrapperInner]:flex-wrap [&_ul_.MuiCollapse-wrapper_.MuiCollapse-wrapperInner]:mt-[2px]'
// 群組（含子群組）：子項目直向排列
const ulGroupAllClass = '[&_ul]:ml-[24px] [&_ul_.MuiCollapse-wrapper_.MuiCollapse-wrapperInner]:flex [&_ul_.MuiCollapse-wrapper_.MuiCollapse-wrapperInner]:gap-[4px] [&_ul_.MuiCollapse-wrapper_.MuiCollapse-wrapperInner]:flex-col'
// 「全部」：店家換行排列
const ulGroupAllMerchantClass = '[&_ul]:ml-[24px] [&_ul_.MuiCollapse-wrapper_.MuiCollapse-wrapperInner]:flex [&_ul_.MuiCollapse-wrapper_.MuiCollapse-wrapperInner]:flex-wrap [&_ul_.MuiCollapse-wrapper_.MuiCollapse-wrapperInner]:gap-[4px]'
const itemClass = 'rounded-[6px] overflow-hidden [&&_.MuiTreeItem-label]:!pl-0 [&_.MuiTreeItem-iconContainer]:!hidden'
const outlineClass = '![outline:2px_solid_rgb(var(--danger))] rounded-[6px]'
const spanClass = 'flex items-center gap-[6px] [word-break:keep-all] whitespace-nowrap text-[14px] leading-[20px] [&_svg]:w-[16px] [&_svg]:h-[16px] [&_svg]:shrink-0 [&_svg]:text-text-secondary'

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
            className={!(data.groups && data.groups.length) ? ulGroupClass : ulGroupAllClass}
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
        className={`${isSelect(data.id)} ${itemClass}${filtIds.includes(data.id) ? ` ${outlineClass}` : ''}`}
        nodeId={data.id}
        label={<RenderLabel isGroup={false} data={data} />}
      />
    ))
  }

  const handleItemClick = data => {
    let index
    const arr = cloneDeep(values)
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
        className={spanClass}
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
          className={treeClass}
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
              className={ulGroupAllMerchantClass}
              style={{ overflow: 'visible' }}
              nodeId='ALL'
              label={
                <span id='ALL' className={spanClass}>
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