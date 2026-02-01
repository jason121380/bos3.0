/** @jsxImportSource @emotion/react */
import {
  Dialog, DialogContent, DialogTitle, Divider, DialogActions, Button
} from '@mui/material'
import { useState, memo, useEffect } from 'react'
import styles from './styles/OuterLinkSortModal'
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { openSnackbar } from 'elements/snackbars'
import { cloneDeep } from 'lodash'
import useFetchSortMerchantCusExternalLink from 'hooks/useFetchSortMerchantCusExternalLink'
import useFetchSortMerchantExternalLink from 'hooks/useFetchSortMerchantExternalLink'

const OuterLinkSortModal = ({
  isCus = false, open, onModalClose, data, refetchLink
}) => {
  const [isClick, setIsClick] = useState(false)
  const [sortData, setSortData] = useState([])
  const { sortExternalLink } = isCus ? useFetchSortMerchantCusExternalLink() : useFetchSortMerchantExternalLink()

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
    <Dialog css={styles.root} open={open}>
      <DialogTitle>
        編輯排序
        <p css={styles.subTitle}>拖動按鈕調整排序</p>
      </DialogTitle>
      <Divider />
      <DialogContent css={styles.Content}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="drop-id">
            {(provided) => (
              <div css={styles.btnWRap} ref={provided.innerRef} {...provided.droppableProps}>
                {sortData.map(({ id, name, isTop }, i) => (
                  <Draggable draggableId={id} index={i} key={id}>
                    {(provided) => (
                      <div
                        css={styles.Button}
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
        <div css={styles.ButtonGroup}>
          <Button disabled={isClick} variant='contained' onClick={onModalClose}>取消</Button>
          <Button
            disabled={isClick}
            color='primary'
            variant='contained'
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