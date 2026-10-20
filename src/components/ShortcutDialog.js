import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from 'ui/dialog'
import { Button as UiButton } from 'ui/button'
import { EmptyState } from 'ui/empty-state'
import { LoaderCircle } from 'lucide-react'
import { Close as CloseIcon } from 'ui/icons'
import { useEffect } from 'react';
import { green } from 'ui/colors';

import { getShortcutsForOrderCreate } from 'hooks/useFetchShortcut'

const ShortcutDialog = ({ open, handleOnClose, handleShortcutChange }) => {
  const [getShortcutFunc, shortcutLazyData] = getShortcutsForOrderCreate()

  const isLoading = !shortcutLazyData.loading && shortcutLazyData.data ? false : true

  const shortcutData = !shortcutLazyData.loading && shortcutLazyData.data
    ? shortcutLazyData.data.shortcuts
    : []

  useEffect(() => {
    open && getShortcutFunc()
  }, [open])

  return (
    <Dialog open={open} onOpenChange={o => !o && handleOnClose()}>
      <DialogContent size="md" hideClose aria-describedby={undefined}>
        <DialogHeader className="flex-row border-0 border-b border-solid border-border !py-[8px] !pr-[8px] !pl-[24px] flex justify-between items-center">
          <DialogTitle>快捷組合</DialogTitle>
          <UiButton variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="關閉" title="關閉" onClick={handleOnClose}>
            <CloseIcon />
          </UiButton>
        </DialogHeader>
        <DialogBody>
          {isLoading ? (
            <div className="flex w-full"><LoaderCircle className="m-auto h-10 w-10 animate-spin text-accent" strokeWidth={1.75} /></div>
          ) : (
            <div className="flex w-full flex-wrap gap-4">
              {shortcutData.length ? shortcutData.map(d => (
                <div key={d.id} >
                  <UiButton
                    variant="secondary"
                    onClick={() => {
                      handleShortcutChange(d)
                      handleOnClose()
                    }}
                  >
                    {d.name}
                  </UiButton>
                </div>
              )) : (
                <EmptyState title="無資料" className="w-full py-6" />
              )}
            </div>
          )}

        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

export default ShortcutDialog