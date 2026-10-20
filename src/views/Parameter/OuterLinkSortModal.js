// 拖曳排序（react-beautiful-dnd）放在有 transform 的 Radix Dialog 內會定位錯誤，保留 MUI Dialog
import { Dialog, DialogContent, DialogTitle, DialogActions } from 'ui/modal-compat'
import { Button } from 'ui/button'
import { useState, memo, useEffect } from 'react'
import { KeyboardDoubleArrowUp as KeyboardDoubleArrowUpIcon } from 'ui/icons'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { openSnackbar } from 'elements/snackbars'
import { cloneDeep } from 'lodash'
import useFetchSortMerchantCusExternalLink from 'hooks/useFetchSortMerchantCusExternalLink'
import useFetchSortMerchantExternalLink from 'hooks/useFetchSortMerchantExternalLink'

const sortButtonClass =
  'text-[#fff] w-[200px] px-[16px] py-[8px] relative bg-[#26a69a] rounded-[4px] text-center font-medium leading-[1.75] text-[0.93rem] mt-[15px] first:mt-0 [&_span]:break-all [&_.svgWrap]:w-[25px] [&_.svgWrap]:h-[25px] [&_.svgWrap]:[transform:translate(-50%,-50%)] [&_.svgWrap]:rounded-[50%] [&_.svgWrap]:bg-[#bf3939] [&_.svgWrap]:flex [&_.svgWrap]:justify-center [&_.svgWrap]:items-center [&_.svgWrap]:absolute [&_.svgWrap]:top-0 [&_.svgWrap]:left-0 [&_.svgWrap_svg]:w-[20px] [&_.svgWrap_svg]:h-[20px]'

const OuterLinkSortModal = ({
  isCus = false, open, onModalClose, data, refetchLink
}) => {
  const [isClick, setIsClick] = useState(false)
  const [sortData, setSortData] = useState([])
  // 兩個 mutation hook 都固定呼叫（hooks 不可條件式呼叫），再依 isCus 取用
  const cusExternalLink = useFetchSortMerchantCusExternalLink()
  const merchantExternalLink = useFetchSortMerchantExternalLink()
  const { sortExternalLink } = isCus ? cusExternalLink : merchantExternalLink

  useEffect(() => {
    setSortData(data)
  }, [data])

  const onDragEnd = (event) => {
    const { source, destination } = event
    if (!destination) {
      return
    }
    let newItems = cloneDeep(sortData)
    const [remove] = newItems.splice(source.index, 1)
    newItems.splice(destination.index, 0, remove)
    setSortData(newItems)
  };

  const handleSubmitData = async () => {
    setIsClick(true)
    try {
      const res = await sortExternalLink({
        input: sortData.map(d => d.id)
      })
      if (res) {
        openSnackbar({
          message: '儲存成功',
          variant: 'success'
        })
        refetchLink()
        onModalClose()
      }
    } catch (error) {
      openSnackbar({
        message: error.message,
        variant: 'error'
      })
    } finally {
      setIsClick(false)
    }
  }

  return (
    <Dialog className="[&_.MuiDialog-paper]:overflow-y-visible [&_.MuiDialogContent-root]:overflow-y-visible [&_.MuiTypography-root]:text-[16px] [&_div.MuiDialogContent-root]:px-[24px] [&_div.MuiDialogContent-root]:py-[16px] [&_.MuiDialogActions-root]:flex [&_.MuiDialogActions-root]:justify-between [&_.MuiDialogActions-root]:px-[24px] [&_.MuiDialogActions-root]:pt-0 [&_.MuiDialogActions-root]:pb-[16px] [&_.MuiDialogActions-root]:flex-wrap [&_.MuiDialogActions-root]:gap-[10px] [&_.MuiDialogTitle-root]:pb-[8px]" open={open}>
      <DialogTitle>
        編輯排序
        <p className="text-[8px] [color:gray]">拖動按鈕調整排序</p>
      </DialogTitle>
      <div className="h-px bg-border" />
      <DialogContent className="flex flex-col max-h-[50vh] overflow-hidden overflow-y-scroll mt-0 mx-0 mb-[15px]">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="drop-id">
            {(provided) => (
              <div className="flex flex-col" ref={provided.innerRef} {...provided.droppableProps}>
                {sortData.map(({ id, name, isTop }, i) => (
                  <Draggable draggableId={id} index={i} key={id}>
                    {(provided) => (
                      <div
                        className={sortButtonClass}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                      >
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
      </DialogContent>
      <DialogActions>
        <div className="flex ml-auto gap-[10px] flex-wrap">
          <Button disabled={isClick} variant="secondary" onClick={onModalClose}>取消</Button>
          <Button
            disabled={isClick}
            variant="primary"
            onClick={handleSubmitData}
          >
            儲存
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  )
}

export default memo(OuterLinkSortModal)