import { Paper, Typography } from 'ui/display-compat'
import { Grid } from 'ui/grid-compat'
import { useState, Fragment } from 'react'
import { styled } from '@mui/material/styles';
import format from 'date-fns/format'
import { Popper, Fade } from '@mui/material'
import { Button } from 'ui/button'
import { CreditCardTwoTone as CreditCardTwoToneIcon } from 'ui/icons'

const C_Popper = styled(Popper)(() => ({
  zIndex: 1,
  '& .MuiPaper-root': {
    maxHeight: 300,
    overflowY: 'scroll',
    '& .MuiGrid-root': {
      padding: '10px 20px',
      minWidth: '190px',
      maxWidth: 400,
      gap: 4,
      display: 'flex',
      flexDirection: 'column',
      '& div.first': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        '& h4': {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }
      },
      '& div.last': {
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        '& h2': {
          fontSize: 14,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }
      }
    }
  }
}));

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
      <C_Popper open={open} anchorEl={anchorEl} placement={placement} transition>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper elevation={12}>
              {data.map((d, index) => (
                <Fragment key={`${d.membershipName}-${index}`}>
                  <Grid>
                    <div className='first'>
                      <CreditCardTwoToneIcon fontSize="medium" />
                      <Typography variant="h4">{d.membershipName}</Typography>
                    </div>
                    <div className='last'>
                      <h2 className="m-0 text-caption font-medium text-text-secondary">效期: {d.expiryDay === null ? '無效期' : format(d.expiryDay, 'yyyy/M/d')}</h2>
                      <h2 className="m-0 text-caption font-medium text-text-secondary">備註: {d.remark}</h2>
                    </div>
                  </Grid>
                  <div className="h-px bg-border" />
                </Fragment>
              ))}
            </Paper>
          </Fade>
        )}
      </C_Popper>
    </Fragment>
  )
}

export default MembershipCardList