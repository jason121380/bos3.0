/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent,
  DialogActions, Checkbox, TextField, InputAdornment
} from '@mui/material'
import { Button } from 'ui/button'
import { TreeView, TreeItem } from '@mui/x-tree-view';
import { ExpandMore as ExpandMoreIcon, ChevronRight as ChevronRightIcon, GroupsRounded as GroupsRoundedIcon, Storefront as StorefrontIcon, SearchRounded as SearchRoundedIcon, ClearRounded as ClearRoundedIcon } from 'ui/icons'
import PropTypes from 'prop-types'
import _, { cloneDeep } from 'lodash';
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
        background: 'rgb(var(--accent) / 0.08)'
      }
    },
    '& li': {
      borderRadius: 5,
      // overflow: 'hidden',
      width: 'fit-content'
    },
    '& .onSelect': {
      background: '#b3e0ee',
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
      marginTop: 2
    },
  }),
  ulGroupAll: css({
    '& ul': {
      marginLeft: 20
    },
    '& ul .MuiCollapse-wrapper .MuiCollapse-wrapperInner': {
      display: 'flex !important',
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
  button: css({
    flexShrink: 0,
    height: 'fit-content'
  }),
  outline: css({
    outline: '2px solid rgb(var(--danger)) !important'
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
            onChange={(e, v) => handleSelectGroup(v, data)}
            style={{ marginTop: -9 }}
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
    <Dialog className='MerchantsListModal' maxWidth='md' fullWidth open={open} onClose={handleOnClose}>
      <DialogTitle variant='h4' css={styles.title}>
        店家列表
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <TextField
            placeholder="搜尋店家"
            type="text"
            variant="standard"
            fullWidth
            size="small"
            onChange={(e) => setValue(e.target.value)}
            value={value}
            css={css({
              width: 150,
              '& input': {
                fontSize: 16,
                padding: '1px 0px 5px !important'
              }
            })}
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
          <Button css={styles.button} onClick={() => setValues([])} variant="secondary">清除選取</Button>
          <Button css={styles.button} onClick={handleExpanedAll} variant="secondary">展開全部</Button>
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
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <Checkbox
              checked={values.length > 0 && values.length === merchantList.allMerchants.length}
              indeterminate={values.length > 0 && values.length < merchantList.allMerchants.length}
              onChange={(e, v) => v ? setValues(merchantList.allMerchants.map(d => d.id)) : setValues([])}
              style={{ marginTop: -9 }}
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
      </DialogContent>
      <DialogActions>
        <Button variant="secondary" onClick={handleOnClose}>關閉</Button>
        <Button variant="primary" onClick={handleComfirm}>確認</Button>
      </DialogActions>
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