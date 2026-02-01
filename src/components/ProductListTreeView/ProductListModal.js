/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, IconButton,
  DialogActions, Button, Checkbox, TextField, InputAdornment
} from '@mui/material'
import { TreeView, TreeItem } from '@mui/x-tree-view';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import PropTypes from 'prop-types'
import _ from 'lodash';
import { css } from '@emotion/react'

const styles = {
  root: css({
    display: 'flex',
    gap: 20,
    flexDirection: 'column',
    '& .Mui-expanded, .Mui-selected': {
      backgroundColor: 'unset !important'
    },
    '& .MuiTreeItem-content': {
      transition: '.2s',
      width: 'fit-content',
      '&:hover': {
        background: '#e2f2ff'
      }
    },
    '& li': {
      borderRadius: 5,
      // overflow: 'hidden'
    }
  }),
  ulGroup: css({
    '& ul': {
      marginLeft: '30px !important'
    },
    '& ul .MuiCollapse-wrapper .MuiCollapse-wrapperInner': {
      display: 'flex',
      gap: '5px !important',
      flexDirection: 'row !important',
      flexWrap: 'wrap',
      marginTop: 2,
      padding: '0px 2px 2px'
    },
  }),
  ulGroupAll: css({
    '& ul': {
      marginLeft: 20
    },
    '& ul .MuiCollapse-wrapper .MuiCollapse-wrapperInner': {
      display: 'flex',
      gap: 10,
      flexDirection: 'column',
    },
  }),
  ulGroupAllMerchant: css({
    '& ul': {
      marginLeft: 20
    },
    '& ul .MuiCollapse-wrapper .MuiCollapse-wrapperInner': {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 10,
    },
  }),
  item: css({
    borderRadius: 5,
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
      marginLeft: 40
    }
  }),
  span: css({
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    wordBreak: 'keep-all',
    whiteSpace: 'nowrap',
    fontSize: '1rem'
  }),
  title: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap'
  }),
  onSelect: css({
    backgroundColor: '#75959f'
  }),
  button: css({
    flexShrink: 0,
    height: 'fit-content'
  }),
  outline: css({
    outline: '2px solid #ff6969 !important'
  })
}

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
        const name = `${d.no && `${d.no} - `}${d.name}`
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
      if (!data.products.length) return
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
            css={styles.ulGroupAllMerchant}
            nodeId={`${data.name}(${data.products.length})`}
            label={<span id={`${data.name}(${data.products.length})`} css={styles.span}><DashboardOutlinedIcon />{`${data.name}(${data.products.length})`}</span>}
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
        className={isSelect(data.id)}
        css={css([styles.item, filtIds.includes(data.id) ? styles.outline : {}])}
        nodeId={data.id}
        label={<span css={styles.span}><Inventory2OutlinedIcon />{`${data.no && `${data.no} - `}${data.name}`}</span>}
      />
    ))
  }

  const handleItemClick = data => {
    let index
    const arr = _.cloneDeep(modalValues)
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
    const values = _.cloneDeep(modalValues)
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
    <Dialog className='MerchantsListModal' maxWidth='md' fullWidth open={open} onClose={handleOnClose}>
      <DialogTitle css={styles.title}>
        商品列表
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
                <IconButton
                  style={{ padding: 4 }}
                  onClick={() => setValue("")}
                ><ClearRoundedIcon /></IconButton>
              )
            }}
          />
          <Button css={styles.button} onClick={() => setModalValues([])} variant='contained' color='primary'>清除選取</Button>
          <Button css={styles.button} onClick={handleExpanedAll} variant='contained' color='primary'>展開全部</Button>
        </div>
      </DialogTitle>
      <DialogContent>
        <TreeView
          css={styles.root}
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
              css={styles.ulGroupAllMerchant}
              style={{ overflow: 'visible' }}
              nodeId='ALL'
              label={
                <span id='ALL' css={styles.span}>
                  <DashboardOutlinedIcon />{`全部(${productList.all.length})`}
                </span>
              }
            >
              {productList.all.length ? renderItem(productList.all) : ''}
            </TreeItem>
          </div>
          {productList.category.length ? renderGroup(productList.category) : ''}
        </TreeView>
      </DialogContent>
      <DialogActions>
        <Button variant='contained' color='inherit' onClick={handleOnClose}>關閉</Button>
        <Button variant='contained' onClick={handleComfirm}>確認</Button>
      </DialogActions>
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