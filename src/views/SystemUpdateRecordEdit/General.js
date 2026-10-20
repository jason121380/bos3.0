import { useState, useEffect, Fragment } from 'react'
import { Button } from 'ui/button'
import { Field, Input } from 'ui/input'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { format } from 'date-fns'
import { MobileDatePicker } from 'ui/date-picker'
import MdEditor from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import { openSnackbar } from 'elements/snackbars'
import { useHistory } from 'react-router'
import { useFetchCreateSystemUpdateEdit } from 'hooks/useFetchSystemUpdateRecord'
const General = ({ editData, setEditData, mdValue, setMdValue }) => {
  const history = useHistory()
  const { SystemUpdateEdit } = useFetchCreateSystemUpdateEdit()
  const [enable, setEnable] = useState(false)
  const [theme, setTheme] = useState('')
  // 等 data-color-mode 出現後讀一次主題。原本 setInterval 寫在 render 本體：每次 render 多一個計時器、卸載後仍會 setState
  useEffect(() => {
    const getTheme = setInterval(() => {
      const mode = document.documentElement.getAttribute('data-color-mode')
      if (mode !== null) {
        setTheme(mode)
        clearInterval(getTheme)
      }
    }, 500)
    return () => clearInterval(getTheme)
  }, [])
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
            <MobileDatePicker
              label="更新日期"
              fieldClassName="w-[300px] max-w-full"
              format="yyyy-MM-dd"
              value={editData.updateTime}
              onChange={date => {
                date && setEditData({
                  ...editData,
                  // 保留原生 type=date 的存值語意：yyyy-MM-dd 字串以 UTC 零點解析，避免換 picker 後差 8 小時
                  updateTime: new Date(format(date, 'yyyy-MM-dd')).getTime(),
                })
              }}
            />
            <Field label="版本" className="w-[300px] max-w-full">
              <Input
                type="text"
                value={editData.versionNo}
                onChange={event => {
                  setEditData({ ...editData, versionNo: event.target.value })
                }}
              />
            </Field>
          </div>
          <Field label="標題" className="my-5">
            <Input
              type="text"
              value={editData.title}
              onChange={event => {
                setEditData({ ...editData, title: event.target.value })
              }}
            />
          </Field>
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
