/** @jsxImportSource @emotion/react */
import { useState, Fragment } from 'react'
import { styled } from '@mui/material/styles';
import format from 'date-fns/format'
import { Popper, Fade, Paper, IconButton, Grid, Divider, Typography } from '@mui/material'
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
      <IconButton
        onClick={handleClickMembership}
        style={{ float: 'right', color: 'gold' }}
      >
        <CreditCardTwoToneIcon fontSize="inherit" />
      </IconButton>
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
                      <Typography component="h2" variant="overline">效期: {d.expiryDay === null ? '無效期' : format(d.expiryDay, 'yyyy/M/d')}</Typography>
                      <Typography component="h2" variant="overline">備註: {d.remark}</Typography>
                    </div>
                  </Grid>
                  <Divider />
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