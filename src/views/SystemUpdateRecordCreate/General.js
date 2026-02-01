/** @jsxImportSource @emotion/react */
import { useState, useEffect, Fragment } from 'react'
import {
  Card, CardContent, CardHeader, Divider, TextField, Grid,
  Button,
} from '@mui/material'
import { format } from 'date-fns'
import MdEditor from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import { openSnackbar } from 'elements/snackbars'
import { useHistory } from 'react-router'
import { useFetchCreateSystemUpdateCreate } from 'hooks/useFetchSystemUpdateRecord'
import { css } from '@emotion/react'

const styles = {
  root: css({}),
  textFieldWidth: css({
    width: '300px',
  }),
  textFieldSpacing: css({
    margin: '20px 0px',
  }),
}

const General = () => {
  const history = useHistory()
  const { SystemUpdateCreate } = useFetchCreateSystemUpdateCreate()
  const [updateRecord, setUpdateRecord] = useState({
    title: '',
    content: '',
    versionNo: '',
    updateTime: new Date().getTime(),
  })
  const [mdValue, setMdValue] = useState('')
  const [enable, setEnable] = useState(true)
  const [theme, setTheme] = useState('')
  const getTheme = setInterval(() => {
    if(document.documentElement.getAttribute('data-color-mode') !== null) {
      setTheme(document.documentElement.getAttribute('data-color-mode'))
      clearInterval(getTheme)
    }
  }, 500);

  const onSubmit = () => {
    setEnable(true)
    SystemUpdateCreate({ input: updateRecord })
      .then(res => {
        if (res.data.createSystemUpdate) {
          openSnackbar({
            message: '新增成功',
            variant: 'success',
          })
          setTimeout(() => {
            history.push('/system-update-record')
          }, 1000)
        } else {
          openSnackbar({
            message: '新增失敗',
            variant: 'error',
          })
          setEnable(false)
        }
      })
      .catch(error => {
        openSnackbar({
          message: error.message,
          variant: 'error',
        })
        setEnable(false)
      })
  }


  useEffect(() => {
    setEnable(
      updateRecord.title === '' ||
      updateRecord.content === '' ||
      updateRecord.versionNo === '' ||
      updateRecord.updateTime === ''
    )
  }, [updateRecord])

  useEffect(() => {
    setUpdateRecord({
      ...updateRecord,
      content: mdValue,
    })
  }, [mdValue])

  return (
    <Fragment>
      <Card style={{ margin: '20px 0' }}>
        <CardHeader title="版本資訊" />
        <Divider />
        <CardContent>
          <Grid container direction="row" style={{ gap: '20px'}}>
            <TextField
              css={styles.textFieldWidth}
              label="更新日期"
              variant="outlined"
              type="date"
              value={format(updateRecord.updateTime, 'yyyy-MM-dd')}
              onChange={event => {
                setUpdateRecord({
                  ...updateRecord,
                  updateTime: new Date(event.target.value).getTime(),
                })
              }}
            />
            <TextField
              css={styles.textFieldWidth}
              label="版本"
              variant="outlined"
              type="text"
              onChange={event => {
                setUpdateRecord({ ...updateRecord, versionNo: event.target.value })
              }}
            />
          </Grid>
          <TextField
            css={styles.textFieldSpacing}
            fullWidth
            label="標題"
            variant="outlined"
            type="text"
            onChange={event => {
              setUpdateRecord({ ...updateRecord, title: event.target.value })
            }}
          />
          <MdEditor
            theme={theme}
            style={{ height: '700px' }}
            modelValue={mdValue}
            language='en-US'
            onChange={value => setMdValue(value)}
            toolbars={[
              'bold',
              'underline',
              'italic',
              '-',
              'strikeThrough',
              'title',
              'sub',
              'sup',
              'quote',
              'unorderedList',
              'orderedList',
              '-',
              'codeRow',
              'code',
              'link',
              'image',
              'table',
              'mermaid',
              'katex',
              '-',
              'revoke',
              'next',
              '=',
              'pageFullscreen',
              'fullscreen',
              'preview',
              'htmlPreview',
              'catalog',
              'github'
            ]}
          />
        </CardContent>
      </Card>
      <Button
        color="primary"
        variant="contained"
        data-testid="createSystemUpdate"
        onClick={onSubmit}
        disabled={enable}
      >
        新增
      </Button>
    </Fragment>
  )
}

export default General
