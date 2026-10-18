/** @jsxImportSource @emotion/react */
import { Card, CardContent, Divider, IconButton, Input, Paper, Tooltip } from '@mui/material'
import { AddPhotoAlternate as AddPhotoIcon, AttachFile as AttachFileIcon, Send as SendIcon } from 'ui/icons'
import PropTypes from 'prop-types'
import { useRef, useState } from 'react'
import { css } from '@emotion/react'
import { theme } from './../../v5theme'

const styles = {
  root: {},
  content: css({
    display: 'flex',
    alignItems: 'center',
  }),
  paper: css({
    flexGrow: 1,
    padding: theme.spacing(0.5, 2),
  }),
  input: css({
    width: '100%',
  }),
  divider: css({
    width: 1,
    height: 24,
  }),
  fileInput: css({
    display: 'none',
  }),
}

function AddPost() {
  const fileInputRef = useRef(null)
  const [value, setValue] = useState('')
  // const session = useSelector(state => state.session)

  const handleOnChange = event => {
    event.persist()
    setValue(event.target.value)
  }

  const handleAttach = () => {
    fileInputRef.current.click()
  }

  return (
    <Card css={styles.root}>
      <CardContent css={styles.content}>
        <Paper css={styles.paper} elevation={1}>
          <Input
            css={styles.input}
            disableUnderline
            onChange={handleOnChange}
            placeholder="What is on your mind, session.user.first_name"
          />
        </Paper>
        <Tooltip title="Send">
          <IconButton color={value.length > 0 ? 'primary' : 'default'}>
            <SendIcon />
          </IconButton>
        </Tooltip>
        <Divider css={styles.divider} />
        <Tooltip title="Attach image">
          <IconButton edge="end" onClick={handleAttach}>
            <AddPhotoIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Attach file">
          <IconButton edge="end" onClick={handleAttach}>
            <AttachFileIcon />
          </IconButton>
        </Tooltip>
        <input css={styles.fileInput} ref={fileInputRef} type="file" />
      </CardContent>
    </Card>
  )
}

AddPost.propTypes = {
  className: PropTypes.string,
}

export default AddPost
