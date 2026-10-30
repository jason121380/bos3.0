// 改 ui/dialog：窗內沒有 Autocomplete／Select／日期選擇器。拖曳排序（react-beautiful-dnd）拖動中的項目是 position: fixed，
// 祖先有 transform 會以祖先為定位基準而偏移，故彈窗本體以 !transform-none＋inset-0 m-auto 置中（不用 -translate-1/2；開關動畫的 transform 只在動畫期間）。
// 原彈窗無 onClose（點背景／Esc 不關閉）：不傳 onOpenChange＋hideClose，只能按「取消」關閉
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { Button } from 'ui/button'
import { useState, memo, useEffect } from 'react'
import { KeyboardDoubleArrowUp as KeyboardDoubleArrowUpIcon } from 'ui/icons'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { openSnackbar } from 'elements/snackbars'
import cloneDeep from 'lodash/cloneDeep'
import useFetchSortMerchantCusExternalLink from 'hooks/useFetchSortMerchantCusExternalLink'
import useFetchSortMerchantExternalLink from 'hooks/useFetchSortMerchantExternalLink'

const sortButtonClass =
  'text-[#fff] w-[200px] px-[16px] py-[8px] relative bg-[#26a69a] rounded-[4px] text-center font-medium leading-[1.75] text-[0.93rem] mt-[15px] first:mt-0 [&_span]:break-all [&_.svgWrap]:w-[25px] [&_.svgWrap]:h-[25px] [&_.svgWrap]:[transform:translate(-50%,-50%)] [&_.svgWrap]:rounded-[50%] [&_.svgWrap]:bg-[#bf3939] [&_.svgWrap]:flex [&_.svgWrap]:justify-center [&_.svgWrap]:items-center [&_.svgWrap]:absolute [&_.svgWrap]:top-0 [&_.svgWrap]:left-0 [&_.svgWrap_svg]:w-[20px] [&_.svgWrap_svg]:h-[20px]'

const OuterLinkSortModal = ({ isCus, open, onModalClose, data, refetchLink }) => {
  const [isClick, setIsClick] = useState(false)
  const [sortData, setSortData] = useState([])
  // 兩個 mutation hook 都固定呼叫（hooks 不可條件式呼叫），再依 isCus 取用
  const cusExternalLink = useFetchSortMerchantCusExternalLink()
  const merchantExternalLink = useFetchSortMerchantExternalLink()
  const { sortExternalLink } = isCus ? cusExternalLink : merchantExternalLink

  useEffect(() => {
    setSortData(data)
  }, [data])

  const onDragEnd = event => {
    const { source, destination } = event
    if (!destination) {
      return
    }
    let newItems = cloneDeep(sortData)
    const [remove] = newItems.splice(source.index, 1)
    newItems.splice(destination.index, 0, remove)
    setSortData(newItems)
  }

  const handleSubmitData = async () => {
    setIsClick(true)
    try {
      // mutation 失敗會拋錯（進 catch），成功一定有回傳
      await sortExternalLink({
        input: sortData.map(d => d.id),
      })
      openSnackbar({
        message: '儲存成功',
        variant: 'success',
      })
      refetchLink()
      onModalClose()
    } catch (error) {
      openSnackbar({
        message: error.message,
        variant: 'error',
      })
    } finally {
      setIsClick(false)
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent size="sm" hideClose className="!transform-none sm:inset-0 sm:m-auto sm:h-fit">
        <DialogHeader>
          <DialogTitle>編輯排序</DialogTitle>
          <DialogDescription>拖動按鈕調整排序</DialogDescription>
        </DialogHeader>
        <DialogBody className="flex max-h-[50vh] flex-col items-center border-0 border-t border-solid border-border">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="drop-id">
              {provided => (
                <div className="flex flex-col" ref={provided.innerRef} {...provided.droppableProps}>
                  {sortData.map(({ id, name, isTop }, i) => (
                    <Draggable draggableId={id} index={i} key={id}>
                      {provided => (
                        <div className={sortButtonClass} {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                          {name}
                          {isCus && isTop && (
                            <div className="svgWrap">
                              <KeyboardDoubleArrowUpIcon />
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </DialogBody>
        <DialogFooter className="flex-wrap">
          <Button disabled={isClick} variant="secondary" onClick={onModalClose}>
            取消
          </Button>
          <Button disabled={isClick} variant="primary" onClick={handleSubmitData}>
            儲存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default memo(OuterLinkSortModal)
