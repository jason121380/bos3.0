import { Checkbox } from 'ui/checkbox'
import { TextField, InputAdornment } from 'ui/text-field'
import MerchantListAutocpmpleteForPinnedTable from 'components/MerchantListAutocpmpleteForPinnedTable'
import useFetchSetPinnedTable from 'hooks/useFetchSetPinnedTable'
import { TreeView, TreeItem } from 'ui/tree'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ArticleOutlined as ArticleOutlinedIcon, DescriptionOutlined as DescriptionOutlinedIcon, ExpandMore as ExpandMoreIcon, ChevronRight as ChevronRightIcon, SearchRounded as SearchRoundedIcon, ClearRounded as ClearRoundedIcon } from 'ui/icons'
import { useDispatch } from 'react-redux'
import { pinnedTableActions } from './../../store/pinnedTable'
import { useState, useEffect } from 'react'
import pageData from 'helper/pageData'
import cloneDeep from 'lodash/cloneDeep';
import { openSnackbar } from 'elements/snackbars';
import produce from 'immer';
import { Button } from 'ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from 'ui/card'
import { Skeleton } from 'ui/skeleton'

// 列樣式由 ui/tree 提供；保留群組間距、20px 縮排與子項換行。
// 原 .Mui-expanded 的 12px 下距：展開中的群組列與子項之間保留間距
const treeClass = 'gap-5 [&_[aria-expanded=true]>[data-tree-content]]:mb-3'
const ulGroupAllMerchantClass = 'ml-5 flex-row flex-wrap gap-2.5'
const itemClass = 'rounded-md'
const outlineClass = 'outline outline-2 outline-danger'
const spanClass = 'flex items-center gap-1 whitespace-nowrap text-base'

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
            groupClassName={ulGroupAllMerchantClass}
            nodeId={title}
            disabled={isClick}
            label={<span id={title} className={spanClass}><ArticleOutlinedIcon />{data.pageTitle}</span>}
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
        className={`${isSelect(pageName)} ${itemClass}${filtIds.includes(pageName) ? ` ${outlineClass}` : ''}`}
        selected={!!isSelect(pageName)}
        nodeId={pageName}
        disabled={isClick}
        label={<span className={spanClass}><DescriptionOutlinedIcon />{pageName}</span>}
      />
    ))
  }

  const handleItemClick = data => {
    let index
    const arr = cloneDeep(submitValue.pages)
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
    const newValue = cloneDeep(submitValue.pages)
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
        <Skeleton className="h-96 w-full" />
      ) : (
        <>
          <MerchantListAutocpmpleteForPinnedTable
            values={merchantListValue}
            setValues={setMerchantListValue}
            onValueChange={v => handleSetValue('stores', v)}
            selectIds={submitValue.stores}
            isClick={isClick}
          />
          <Card className="mt-4">
            <CardHeader
              className="flex-wrap items-center pb-4"
              action={
                <div className="flex items-center gap-2">
                  <TextField
                    className="[&_input]:!pl-0"
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
                        <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="清除搜尋文字" title="清除搜尋文字" onClick={() => setSearchText("")}><ClearRoundedIcon /></Button>
                      )
                    }}
                  />
                  <Button size="sm" variant="secondary" disabled={isClick} onClick={() => handleSetValue('pages', [])}>清除選取</Button>
                  <Button size="sm" variant="secondary" disabled={isClick} onClick={handleExpanedAll}>展開全部</Button>
                </div>
              }
            >
              <CardTitle>功能釘選設定</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100vh-500px)] border-0 border-t border-solid border-border">
              <div className="grid h-full grid-cols-3 gap-4">
                <div className="col-span-2 h-full overflow-y-auto overflow-x-hidden border-0 border-r border-solid border-border pr-3">
                  <TreeView
                    aria-label="功能釘選"
                    aria-multiselectable="true"
                    className={treeClass}
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}
                    selected={null}
                    expanded={expandedArr}
                    onToggle={handleNodeFocus}
                  >
                    {pages.length ? renderGroup(pages) : ''}
                  </TreeView>

                </div>
                <div className="flex h-full flex-col">
                  <div className="mb-3 text-label text-text-secondary">拖動按鈕調整排序</div>
                  <div className="flex-grow overflow-y-auto overflow-x-hidden pr-3">
                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="drop-id">
                        {(provided) => (
                          <div className="flex flex-col gap-2" ref={provided.innerRef} {...provided.droppableProps}>
                            {submitValue.pages.map((name, i) => (
                              <Draggable draggableId={name} index={i} key={name}>
                                {(provided) => (
                                  <div
                                    className="break-all rounded-md border border-solid border-border bg-background px-4 py-2 text-body font-medium text-text"
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
                </div>

              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="primary"
                onClick={handleSetData}
              >
                儲存變更
              </Button>
            </CardFooter>
          </Card>

        </>
      )}

    </>
  )
}

export default PinnedTable
