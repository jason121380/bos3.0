/** @jsxImportSource @emotion/react */
import { Button, Card, CardContent, CardHeader, Divider, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/DeleteOutline'
import GetAppIcon from '@mui/icons-material/GetApp'
import NotInterestedIcon from '@mui/icons-material/NotInterested'
import PropTypes from 'prop-types'
import { css } from '@emotion/react'
import { theme } from '../../../theme'

const styles = {
  root: css({}),
  mainActions: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  }),
  notice: css({
    marginTop: theme.spacing(1),
  }),
  deleteButton: css({
    marginTop: theme.spacing(1),
    color: theme.palette.common.white,
    backgroundColor: theme.palette.error.main,
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  }),
  buttonIcon: css({
    marginRight: theme.spacing(1),
  }),
}

function OtherActions({ className = {}, ...rest }) {
  return (
    <Card {...rest} css={css([styles.root, className])}>
      <CardHeader title="其他操作" />
      <Divider />
      <CardContent>
        <div css={styles.mainActions}>
          <Button>
            <NotInterestedIcon css={styles.buttonIcon} />
            暫時停用客戶
          </Button>
          <Button>
            <GetAppIcon css={styles.buttonIcon} />
            匯出客戶資訊
          </Button>
        </div>
        <Typography css={styles.notice} variant="body2">
          刪除客戶將不會刪除其所有資料，只會將其隱藏。
        </Typography>
        <Button css={styles.deleteButton}>
          <DeleteIcon css={styles.buttonIcon} />
          刪除客戶
        </Button>
      </CardContent>
    </Card>
  )
}

OtherActions.propTypes = {
  className: PropTypes.object,
}

export default OtherActions
