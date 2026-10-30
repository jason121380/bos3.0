import { Plus, Redo2, Undo2 } from 'lucide-react'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

function Header({
  handleAddScheduleCard,
  handleUndoScheduleCard,
  handleRedoScheduleCard,
  disableButton,
  disableButtonUndo,
  disableButtonRedo,
  undoActive,
}) {
  const merchantName = JSON.parse(localStorage.getItem('userMerchant')).name

  return (
    <PageHeader
      title="排班表"
      actions={
        <>
          {undoActive && (
            <>
              <Button variant="secondary" onClick={handleUndoScheduleCard} disabled={disableButton || disableButtonUndo}>
                <Undo2 strokeWidth={1.75} />
                復原
              </Button>
              <Button variant="secondary" onClick={handleRedoScheduleCard} disabled={disableButton || disableButtonRedo}>
                <Redo2 strokeWidth={1.75} />
                重做
              </Button>
            </>
          )}
          <Button variant="primary" onClick={handleAddScheduleCard} disabled={disableButton}>
            <Plus strokeWidth={1.75} />
            新增
          </Button>
        </>
      }
    />
  )
}

export default Header
