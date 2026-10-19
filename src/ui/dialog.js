import React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn, focusRing } from './utils'

// STYLE.md §6：寬 480 / 640 / 800；標題、內容、底部動作三段
const sizes = { sm: 'max-w-[480px]', md: 'max-w-[640px]', lg: 'max-w-[800px]' }

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close

const DialogContent = React.forwardRef(({ className, size = 'sm', children, hideClose, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-[1300] bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'ui-root fixed left-1/2 top-1/2 z-[1300] flex max-h-[calc(100vh-48px)] w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col',
        'rounded-2xl border border-solid border-border bg-background shadow-float outline-none',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        sizes[size],
        // 手機：改為由底部滑出的面板（bottom sheet），避開底部指示條
        'max-sm:inset-x-0 max-sm:bottom-0 max-sm:left-0 max-sm:top-auto max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0',
        'max-sm:rounded-b-none max-sm:rounded-t-2xl max-sm:border-x-0 max-sm:border-b-0 max-sm:pb-[env(safe-area-inset-bottom)]',
        'max-sm:data-[state=open]:zoom-in-100 max-sm:data-[state=open]:slide-in-from-bottom-1/2 max-sm:data-[state=closed]:zoom-out-100 max-sm:data-[state=closed]:slide-out-to-bottom-1/2',
        className
      )}
      {...props}
    >
      <div aria-hidden="true" className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-border-strong sm:hidden" />
      {children}
      {!hideClose && (
        <DialogPrimitive.Close
          aria-label="關閉"
          className={cn('absolute right-4 top-4 rounded-md p-1 text-text-tertiary hover:bg-surface-hover hover:text-text', focusRing)}
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
DialogContent.displayName = 'DialogContent'

const DialogHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col gap-1 px-6 pb-2 pr-12 pt-6 max-sm:px-4 max-sm:pr-12 max-sm:pt-3', className)} {...props} />
)
const DialogBody = ({ className, ...props }) => (
  <div className={cn('flex-1 overflow-y-auto px-6 py-4 max-sm:px-4', className)} {...props} />
)
const DialogFooter = ({ className, ...props }) => (
  <div className={cn('flex items-center justify-end gap-2 border-0 border-t border-solid border-border px-6 py-4 max-sm:px-4 max-sm:[&>button]:flex-1', className)} {...props} />
)

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('text-heading text-text', className)} {...props} />
))
DialogTitle.displayName = 'DialogTitle'

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-body text-text-secondary', className)} {...props} />
))
DialogDescription.displayName = 'DialogDescription'

export { Dialog, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogTitle, DialogDescription }
