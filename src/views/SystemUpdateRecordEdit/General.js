/** @jsxImportSource @emotion/react */
import { useState, useEffect, Fragment } from 'react'
import { TextField } from '@mui/material'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { format } from 'date-fns'
import MdEditor from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import { openSnackbar } from 'elements/snackbars'
import { useHistory } from 'react-router'
import { useFetchCreateSystemUpdateEdit } from 'hooks/useFetchSystemUpdateRecord'
import { css } from '@emotion/react'

const styles = {
  root: css({}),
  textFieldWidth: css({
    width: '300px',
  }),
  textFieldSpacing: css({
    margin: '20px 0',
  }),
}

const General = ({ editData, setEditData, mdValue, setMdValue }) => {
  const history = useHistory()
  const { SystemUpdateEdit } = useFetchCreateSystemUpdateEdit()
  const [enable, setEnable] = useState(false)
  const [theme, setTheme] = useState('')
  const getTheme = setInterval(() => {
    if(document.documentElement.getAttribute('data-color-mode') !== null) {
      setTheme(document.documentElement.getAttribute('data-color-mode'))
      clearInterval(getTheme)
    }
  }, 500);
  const onSubmit = () => {
    setEnable(false)
    SystemUpdateEdit({ input: editData })
      .then(res => {
        if (res.data.updateSystemUpdate) {
          openSnackbar({
            message: '儲存成功',
            variant: 'success',
          })
          setTimeout(() => {
            history.push('/system-update-record')
          }, 1000)
        } else {
          openSnackbar({
            message: '儲存失敗',
            variant: 'error',
          })
          setEnable(true)
        }
      })
      .catch(error => {
        openSnackbar({
          message: error.message,
          variant: 'error',
        })
        setEnable(true)
      })
  }

  useEffect(() => {
    setEnable(
      !(
        editData.title === '' ||
        editData.content === '' ||
        editData.versionNo === '' ||
        editData.updateTime === ''
      )
    )
  }, [editData])

  useEffect(() => {
    setEditData({
      ...editData,
      content: mdValue,
    })
  }, [mdValue])
  return (
    <Fragment>
      <Card>
        <CardHeader>
          <CardTitle>版本資訊</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-5">
            <TextField
              css={styles.textFieldWidth}
              label="更新日期"
              variant="outlined"
              type="date"
              value={format(editData.updateTime, 'yyyy-MM-dd')}
              onChange={event => {
                event.target.value &&
                  setEditData({
                    ...editData,
                    updateTime: new Date(event.target.value).getTime(),
                  })
              }}
            />
            <TextField
              css={styles.textFieldWidth}
              value={editData.versionNo}
              label="版本"
              variant="outlined"
              type="text"
              onChange={event => {
                setEditData({ ...editData, versionNo: event.target.value })
              }}
            />
          </div>
          <TextField
            css={styles.textFieldSpacing}
            fullWidth
            label="標題"
            variant="outlined"
            type="text"
            value={editData.title}
            onChange={event => {
              setEditData({ ...editData, title: event.target.value })
            }}
          />
          <MdEditor
            theme={theme}
            style={{height: '700px'}}
            modelValue={mdValue}
            language='en-US'
            onChange={value=>setMdValue(value)}
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
      <div className="mt-6 flex justify-end">
        <Button
          variant="primary"
          data-testid="createSystemUpdate"
          onClick={onSubmit}
          disabled={!enable}
        >
          儲存
        </Button>
      </div>
    </Fragment>
  )
}

export default General
