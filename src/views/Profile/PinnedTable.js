/** @jsxImportSource @emotion/react */
import {
  Button, Card, CardActions, CardContent, CardHeader, Divider,
  Grid, IconButton, Checkbox, TextField, InputAdornment,
  CircularProgress
} from '@mui/material'
import MerchantListAutocpmpleteForPinnedTable from 'components/MerchantListAutocpmpleteForPinnedTable'
import useFetchSetPinnedTable from 'hooks/useFetchSetPinnedTable'
import { TreeView, TreeItem } from '@mui/x-tree-view';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import { useDispatch } from 'react-redux'
import { pinnedTableActions } from './../../store/pinnedTable'
import { useState, useEffect } from 'react'
import pageData from 'helper/pageData'
import { css } from '@emotion/react'
import { cloneDeep } from 'lodash';
import { openSnackbar } from 'elements/snackbars';
import produce from 'immer';

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
    '& .Mui-expanded': {
      marginBottom: 12,
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
    '& .MuiTypography-root': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }),
  button: css({
    flexShrink: 0,
    height: 'fit-content'
  }),
  outline: css({
    outline: '2px solid #ff6969 !important'
  }),
  textField: css({
    '& input': {
      paddingLeft: '0px !important',
    }
  }),
  DragButton: css({
    color: '#fff',
    // width: 200,
    padding: '8px 16px',
    position: 'relative',
    background: '#26a69a',
    borderRadius: '4px',
    textAlign: 'center',
    fontWeight: 500,
    lineHeight: '1.75',
    fontSize: '0.93rem',
    marginTop: 15,
    '&:first-of-type': {
      marginTop: 0
    },
    '& span': {
      wordBreak: 'break-all',
    },
    '& .svgWrap': {
      width: 25,
      height: 25,
      transform: 'translate(-50%, -50%)',
      borderRadius: '50%',
      background: '#bf3939',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      '& svg': {
        width: 20,
        height: 20,
      }
    }
  }),
  btnWrap: css({
    display: 'flex',
    flexDirection: 'column'
  }),
}

function PinnedTable({ isLoading, pages, submitValue, setSubmitValue }) {
  const allNodeIds = []
  const dispatch = useDispatch()
  const { setPinnedTable } = useFetchSetPinnedTable()
  const [searchText, setSearchText] = useState('')
  const [merchantListValue, setMerchantListValue] = useState([])
  const [expandedArr, setExpandedArr] = useState([])
  const [filtIds, setFiltIds] = useState([])
  const [isClick, setIsClick] = useState(false)
  const handleSetValue = (key, value) => {
    setSubmitValue(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  const renderGroup = group => {
    return group.map((data, index) => {
      const title = data.pageTitle === '預約管理' ? '預約管理-title' : data.pageTitle
      allNodeIds.push(title)
      return (
        <div
          key={`${title}-${index}`}
          style={{ display: 'flex', alignItems: 'flex-start' }}
        >
          <Checkbox
            checked={isCheckedOrIndeterminat(data, 'checked?')}
            indeterminate={isCheckedOrIndeterminat(data, 'indeterminate?')}
            onChange={(e, v) => handleSelectGroup(v, data)}
            style={{ marginTop: -9 }}
            disabled={isClick}
          />
          <TreeItem
            css={styles.ulGroupAllMerchant}
            nodeId={title}
            disabled={isClick}
            label={<span id={title} css={styles.span}><ArticleOutlinedIcon />{data.pageTitle}</span>}
          >
            {data.pageAuthority.length ? renderItem(data.pageAuthority) : ''}
          </TreeItem>
        </div>
      )
    })
  }

  const renderItem = page => {
    return page.map(({ pageName }) => (
      <TreeItem
        key={pageName}
        onClick={() => handleItemClick(pageName)}
        className={isSelect(pageName)}
        css={css([styles.item, filtIds.includes(pageName) ? styles.outline : {}])}
        nodeId={pageName}
        disabled={isClick}
        label={<span css={styles.span}><DescriptionOutlinedIcon />{pageName}</span>}
      />
    ))
  }

  const handleItemClick = data => {
    let index
    const arr = _.cloneDeep(submitValue.pages)
    const findData = arr.find((d, i) => {
      if (d === data) {
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
    handleSetValue('pages', arr)
  }

  const isSelect = id => {
    const findData = submitValue.pages.find(d => d === id)
    return findData ? 'onSelect' : ''
  }

  const handleSelectGroup = (checked, data) => {
    const groupPages = data.pageAuthority
    const inModalValues = []
    const notInModalValues = []
    const newValue = _.cloneDeep(submitValue.pages)
    if (checked) {
      groupPages.forEach(d => {
        const findData = submitValue.pages.find(data => data === d.pageName)
        findData ? inModalValues.push(d.pageName) : notInModalValues.push(d.pageName)
      })
      newValue.push(...notInModalValues)
    } else {
      groupPages.forEach(d => {
        let index
        const findData = newValue.find((data, i) => {
          if (d.pageName === data) {
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
    handleSetValue('pages', newValue)
  }

  const isCheckedOrIndeterminat = (data, type) => {
    const groupPages = data.pageAuthority
    const inModalValues = []
    const notInModalValues = []
    groupPages.forEach(d => {
      const findData = submitValue.pages.find(data => data === d.pageName)
      findData ? inModalValues.push(d.pageName) : notInModalValues.push(d.pageName)
    })
    if (type === 'checked?') {
      return submitValue.pages.length > 0 && notInModalValues.length === 0
    } else {
      return inModalValues.length > 0 && inModalValues.length < groupPages.length
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

  const onDragEnd = (event) => {
    const { source, destination } = event
    if (!destination) {
      return
    }
    let newItems = cloneDeep(submitValue.pages)
    const [remove] = newItems.splice(source.index, 1)
    newItems.splice(destination.index, 0, remove)
    handleSetValue('pages', newItems)
  };

  const handleSetData = async () => {
    setIsClick(true)

    const inputValue = {
      otherAppliedStoreIds: submitValue.stores,
      pinnedTables: []
    }
    submitValue.pages.forEach(title => {
      const findData = pageData.find(d => title === d.title)
      if (findData) {
        inputValue.pinnedTables.push({ title: findData.groupTitle, name: title })
      }
    })
    try {
      const res = await setPinnedTable(inputValue)

      if (res.data.setPinnedTable) {
        openSnackbar({
          variant: 'success',
          message: '設定成功'
        })
        const pages = []
        inputValue.pinnedTables.forEach(({ name }) => {
          const findRouteData = pageData.find(({ title }) => title === name)
          if (findRouteData) {
            pages.push({ title: findRouteData.title, href: findRouteData.href })
          }
        })
        dispatch(pinnedTableActions.setPinnedTable(pages))
      } else {
        openSnackbar({
          variant: 'warning',
          message: '設定失敗'
        })
      }
      
    } catch (error) {
      openSnackbar({
        variant: 'error',
        message: error.message
      })
    } finally {
      setIsClick(false)
    }
  }

  useEffect(() => {
    if (!searchText) {
      setFiltIds([]);
      return;
    }

    const allPage = []
    pages.forEach(({ pageAuthority }) => {
      allPage.push(...pageAuthority.map(d => d.pageName))
    })

    const filterMerchantsId = allPage.filter(
      d => d.toLowerCase().includes(searchText.toLowerCase())
    );
    setFiltIds(filterMerchantsId);
  }, [searchText]);

  return (
    <>
      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: '100px' }}><CircularProgress /></div>
      ) : (
        <>
          <MerchantListAutocpmpleteForPinnedTable
            values={merchantListValue}
            setValues={setMerchantListValue}
            onValueChange={v => handleSetValue('stores', v)}
            selectIds={submitValue.stores}
            isClick={isClick}
          />
          <Card sx={{ mt: 2 }}>
            <CardHeader
              title='功能釘選設定'
              css={styles.title}
              action={
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <TextField
                    css={styles.textField}
                    placeholder="搜尋頁面"
                    type="text"
                    variant="standard"
                    fullWidth
                    size="small"
                    onChange={(e) => setSearchText(e.target.value)}
                    value={searchText}
                    style={{ width: 150 }}
                    disabled={isClick}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment style={{ padding: 4 }} position="start">
                          <SearchRoundedIcon style={{ marginLeft: -8 }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchText && (
                        <IconButton
                          style={{ padding: 4 }}
                          onClick={() => setSearchText("")}
                        ><ClearRoundedIcon /></IconButton>
                      )
                    }}
                  />
                  <Button disabled={isClick} css={styles.button} onClick={() => handleSetValue('pages', [])} variant='contained' color='primary'>清除選取</Button>
                  <Button disabled={isClick} css={styles.button} onClick={handleExpanedAll} variant='contained' color='primary'>展開全部</Button>
                </div>
              }
            ></CardHeader>
            <Divider />
            <CardContent style={{ height: 'calc(100vh - 500px)' }}>
              <Grid container spacing={2} style={{ height: '100%' }}>
                <Grid item xs={8} style={{ borderRight: '1px solid #eeeeee', paddingRight: 12, overflow: 'hidden auto', height: '100%' }} >
                  <TreeView
                    css={styles.root}
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}
                    expanded={expandedArr}
                    onNodeToggle={handleNodeFocus}
                  >
                    {pages.length ? renderGroup(pages) : ''}
                  </TreeView>

                </Grid>
                <Grid item style={{ display: 'flex', height: '100%', flexDirection: 'column' }} xs={4}>
                  <div style={{ marginBottom: 12 }}>拖動按鈕調整排序</div>
                  <div style={{ flexGrow: 1, overflow: 'hidden auto', paddingRight: 12 }} >
                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="drop-id">
                        {(provided) => (
                          <div css={styles.btnWrap} ref={provided.innerRef} {...provided.droppableProps}>
                            {submitValue.pages.map((name, i) => (
                              <Draggable draggableId={name} index={i} key={name}>
                                {(provided) => (
                                  <div
                                    css={styles.DragButton}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    ref={provided.innerRef}
                                  >
                                    {name}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                </Grid>

              </Grid>
            </CardContent>
            <Divider />
            <CardActions>
              <Button
                variant="contained"
                color='primary'
                onClick={handleSetData}
              >
                儲存變更
              </Button>
            </CardActions>
          </Card>

        </>
      )}

    </>
  )
}

export default PinnedTable
