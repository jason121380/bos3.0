import { Checkbox } from 'ui/checkbox'
import { TextField, InputAdornment } from 'ui/text-field'
import { useState, useEffect } from 'react'
import { Button } from 'ui/button'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { TreeView, TreeItem } from 'ui/tree-compat'
import { ExpandMore as ExpandMoreIcon, ChevronRight as ChevronRightIcon, Inventory2Outlined as Inventory2OutlinedIcon, DashboardOutlined as DashboardOutlinedIcon, SearchRounded as SearchRoundedIcon, ClearRounded as ClearRoundedIcon } from 'ui/icons'
import PropTypes from 'prop-types'
import cloneDeep from 'lodash/cloneDeep';

// 樹狀本體為 ui/tree-compat（輸出 MUI 同名 class），以下為原 emotion styles 等值轉 Tailwind；tree-compat.css 在路由 chunk（晚於 Tailwind 與 emotion），同權重勝負不變，故不加 !
const treeClass = [
  'flex gap-[20px] flex-col',
  '[&_.Mui-expanded]:![background-color:unset] [&_.Mui-selected]:![background-color:unset]',
  '[&_.MuiTreeItem-content]:[transition:.2s] [&_.MuiTreeItem-content]:w-fit',
  '[&_.MuiTreeItem-content:hover]:[background:rgb(var(--accent)/0.08)]',
  '[&_li]:rounded-[5px]',
].join(' ')
const ulGroupAllMerchantClass = '[&_ul]:ml-[20px] [&_ul_.MuiCollapse-wrapper_.MuiCollapse-wrapperInner]:flex [&_ul_.MuiCollapse-wrapper_.MuiCollapse-wrapperInner]:flex-wrap [&_ul_.MuiCollapse-wrapper_.MuiCollapse-wrapperInner]:gap-[10px]'
const itemClass = 'rounded-[5px] overflow-hidden [&_.MuiTreeItem-label]:!pl-0 [&_.MuiTreeItem-iconContainer]:!hidden'
const outlineClass = '![outline:2px_solid_rgb(var(--danger))]'
const spanClass = 'flex items-center gap-[5px] [word-break:keep-all] whitespace-nowrap text-[1rem]'
// 原 height: fit-content 為 emotion（晚於 Tailwind）會連手機的 max-sm:h-10 一起蓋掉，故同時給 max-sm:h-fit
const buttonClass = 'shrink-0 h-fit max-sm:h-fit'

const ProductListModal = ({ open, setOpen, productList, values, setValues }) => {
  const allNodeIds = ['ALL']
  const [modalValues, setModalValues] = useState(values)
  const [expandedArr, setExpandedArr] = useState([])
  const [value, setValue] = useState('')
  const [filtIds, setFiltIds] = useState([])

  useEffect(() => {
    if (open) {
      open && setModalValues(values)
    }
  }, [open])

  useEffect(() => {
    if (!value) {
      setFiltIds([]);
      return;
    }

    const filterMerchantsId = productList.all
      .filter(d => {
        const name = `${d.no ? `${d.no} - ` : ''}${d.name}`
        return name.toLowerCase().includes(value.toLowerCase())
      })
      .map(d => d.id);

    setFiltIds(filterMerchantsId);

    if (filterMerchantsId.length > 0 && !expandedArr.includes('ALL')) {
      setExpandedArr(prevExpandedArr => [...prevExpandedArr, 'ALL']);
    }
  }, [value]);

  const renderGroup = group => {
    return group.map((data, index) => {
      if (!data.products.length) return null
      allNodeIds.push(`${data.name}(${data.products.length})`)
      return (
        <div
          key={`${data.name}-${index}`}
          style={{ display: 'flex', alignItems: 'flex-start' }}
        >
          <Checkbox
            checked={isCheckedOrIndeterminat(data, 'checked?')}
            indeterminate={isCheckedOrIndeterminat(data, 'indeterminate?')}
            onChange={(e, v) => handleSelectGroup(v, data)}
            style={{ marginTop: -9 }}
          />
          <TreeItem
            className={ulGroupAllMerchantClass}
            nodeId={`${data.name}(${data.products.length})`}
            label={<span id={`${data.name}(${data.products.length})`} className={spanClass}><DashboardOutlinedIcon />{`${data.name}(${data.products.length})`}</span>}
          >
            {data.products.length ? renderItem(data.products) : ''}
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
        label={<span className={spanClass}><Inventory2OutlinedIcon />{`${data.no ? `${data.no} - ` : ''}${data.name}`}</span>}
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

  const isSelect = id => {
    const findData = modalValues.find(d => d.id === id)
    return findData ? 'onSelect' : ''
  }

  const handleComfirm = () => {
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


  const handleSelectGroup = (checked, data) => {
    const groupMerchants = data.products
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

  const isCheckedOrIndeterminat = (data, type) => {
    const groupMerchants = data.products
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
    // 舊版 MUI Dialog 有 onClose（點背景／Esc 關閉），以 onOpenChange 轉接；hideClose 不另加 X 鈕，寬度保留 MUI md（960px），className 保留 scss 掛點
    <Dialog open={open} onOpenChange={o => { if (!o) handleOnClose() }}>
      <DialogContent size="lg" className="MerchantsListModal max-w-[960px]" hideClose aria-describedby={undefined}>
      <DialogHeader className="flex-row flex-wrap items-center justify-between gap-4 pr-6">
          <DialogTitle>商品列表</DialogTitle>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <TextField
            placeholder="搜尋商品"
            type="text"
            variant="standard"
            fullWidth
            size="small"
            onChange={(e) => setValue(e.target.value)}
            value={value}
            style={{ width: 150 }}
            InputProps={{
              startAdornment: (
                <InputAdornment style={{ padding: 4 }} position="start">
                  <SearchRoundedIcon style={{ marginLeft: -8 }} />
                </InputAdornment>
              ),
              endAdornment: value && (
                <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="清除搜尋文字" title="清除搜尋文字" onClick={() => setValue("")}><ClearRoundedIcon /></Button>
              )
            }}
          />
          <Button className={buttonClass} onClick={() => setModalValues([])} variant="secondary">清除選取</Button>
          <Button className={buttonClass} onClick={handleExpanedAll} variant="secondary">展開全部</Button>
        </div>
      </DialogHeader>
      <DialogBody>
        <TreeView
          className={treeClass}
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          expanded={expandedArr}
          onNodeToggle={handleNodeFocus}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start'}}>
            <Checkbox
              checked={modalValues.length > 0 && modalValues.length === productList.all.length}
              indeterminate={modalValues.length > 0 && modalValues.length < productList.all.length}
              onChange={(e, v) => v ? setModalValues(productList.all) : setModalValues([])}
              style={{ marginTop: -9 }}
            />
            <TreeItem
              className={ulGroupAllMerchantClass}
              style={{ overflow: 'visible' }}
              nodeId='ALL'
              label={
                <span id='ALL' className={spanClass}>
                  <DashboardOutlinedIcon />{`全部(${productList.all.length})`}
                </span>
              }
            >
              {productList.all.length ? renderItem(productList.all) : ''}
            </TreeItem>
          </div>
          {productList.category.length ? renderGroup(productList.category) : ''}
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

ProductListModal.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  merchantList: PropTypes.object,
  values: PropTypes.array,
  setValues: PropTypes.func
}

export default ProductListModal