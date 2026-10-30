// 浮層改 ui/popover（Radix，非模態）：開關仍只由按鈕切換（受控 open、不接 onOpenChange，點外面／Esc 不關閉，同原 Popper）；
// 定位錨點仍是 anchorEl state（virtualRef），開啟時焦點留在按鈕（onOpenAutoFocus preventDefault，同原 Popper 不搶焦點）；淡入改 Popover 內建動畫
import { Popover, PopoverAnchor, PopoverContent } from 'ui/popover'
import { useState, Fragment } from 'react'
import format from 'date-fns/format'
import { Button } from 'ui/button'
import { CreditCardTwoTone as CreditCardTwoToneIcon } from 'ui/icons'

const MembershipCardList = ({ data }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [open, setOpen] = useState(false)
  const [placement, setPlacement] = useState()

  const handleClickMembership = event => {
    setAnchorEl(event.currentTarget)
    setOpen(prev => placement !== 'bottom' || !prev)
    setPlacement('bottom')
  }

  return (
    <Fragment>
      <Button
        variant="ghost"
        size="icon"
        aria-label="會員卡清單"
        title="會員卡清單"
        onClick={handleClickMembership}
        style={{ float: 'right', color: 'gold' }}
      >
        <CreditCardTwoToneIcon fontSize="inherit" />
      </Button>
      <Popover open={open}>
        <PopoverAnchor virtualRef={{ current: anchorEl }} />
        <PopoverContent
          className="z-[1] max-h-[300px] overflow-y-auto"
          side={placement}
          align="center"
          sideOffset={0}
          onOpenAutoFocus={e => e.preventDefault()}
          aria-label="會員卡清單"
        >
          {data.map((d, index) => (
            <Fragment key={`${d.membershipName}-${index}`}>
              <div className="flex min-w-[190px] max-w-[400px] flex-col gap-1 px-5 py-2.5">
                <div className="first flex items-center justify-between gap-2.5">
                  <CreditCardTwoToneIcon fontSize="medium" />
                  <h4 className="m-0 truncate text-heading text-text">{d.membershipName}</h4>
                </div>
                <div className="last flex flex-col gap-[5px]">
                  <h2 className="m-0 truncate text-label text-text-secondary">
                    效期: {d.expiryDay === null ? '無效期' : format(d.expiryDay, 'yyyy/MM/dd')}
                  </h2>
                  <h2 className="m-0 truncate text-label text-text-secondary">備註: {d.remark}</h2>
                </div>
              </div>
              <div className="h-px bg-border" />
            </Fragment>
          ))}
        </PopoverContent>
      </Popover>
    </Fragment>
  )
}

export default MembershipCardList
