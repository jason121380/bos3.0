/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, IconButton,
  DialogActions, Button, Checkbox, TextField, InputAdornment
} from '@mui/material'
import { TreeView, TreeItem } from '@mui/x-tree-view';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import StorefrontIcon from '@mui/icons-material/Storefront';
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
    outline: '2px solid #ff6969 !important'
  })
}

const MerchantsListModal = ({ open, setOpen, merchantList, values, setValues }) => {
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

  const isCheckedOrIndeterminat = (data, type) => {
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
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <Checkbox
              checked={modalValues.length > 0 && modalValues.length === merchantList.allMerchants.length}
              indeterminate={modalValues.length > 0 && modalValues.length < merchantList.allMerchants.length}
              onChange={(e, v) => v ? setModalValues(merchantList.allMerchants) : setModalValues([])}
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
        <Button variant='contained' color='inherit' onClick={handleOnClose}>關閉</Button>
        <Button variant='contained' onClick={handleComfirm}>確認</Button>
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