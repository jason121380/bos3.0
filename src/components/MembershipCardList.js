// 保留相容層 Popper／Fade：此浮層只由按鈕切換、點外面不關閉（非模態），改用 ui/popover（Radix）會改變關閉行為；定位仍依 anchorEl state
import { Popper, Fade } from 'ui/overlay-compat'
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
      <Popper className="z-[1]" open={open} anchorEl={anchorEl} placement={placement} transition>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <div className="ui-root max-h-[300px] overflow-y-scroll rounded-lg border border-solid border-border bg-background shadow-float">
              {data.map((d, index) => (
                <Fragment key={`${d.membershipName}-${index}`}>
                  <div className="flex min-w-[190px] max-w-[400px] flex-col gap-1 px-5 py-2.5">
                    <div className='first flex items-center justify-between gap-2.5'>
                      <CreditCardTwoToneIcon fontSize="medium" />
                      <h4 className="m-0 truncate text-[18px] font-bold leading-[26px] text-text">{d.membershipName}</h4>
                    </div>
                    <div className='last flex flex-col gap-[5px]'>
                      <h2 className="m-0 truncate text-[14px] font-medium leading-4 text-text-secondary">效期: {d.expiryDay === null ? '無效期' : format(d.expiryDay, 'yyyy/MM/dd')}</h2>
                      <h2 className="m-0 truncate text-[14px] font-medium leading-4 text-text-secondary">備註: {d.remark}</h2>
                    </div>
                  </div>
                  <div className="h-px bg-border" />
                </Fragment>
              ))}
            </div>
          </Fade>
        )}
      </Popper>
    </Fragment>
  )
}

export default MembershipCardList