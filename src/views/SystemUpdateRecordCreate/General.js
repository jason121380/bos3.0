import { useState, useEffect, Fragment } from 'react'
import { format } from 'date-fns'
import MdEditor from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import { openSnackbar } from 'elements/snackbars'
import { useHistory } from 'react-router'
import { useFetchCreateSystemUpdateCreate } from 'hooks/useFetchSystemUpdateRecord'
import { Button } from 'ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'

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
      {/*
        .ui-root 的基礎樣式（清除 ul/ol 清單符號、標題外距）會影響 Markdown 編輯器的預覽，
        因此只把 ui-root 套在表單欄位與按鈕區，MdEditor 放在 ui-root 之外，維持原本的編輯／預覽外觀
      */}
      <Card className="mb-6">
        <div className="ui-root">
          <CardHeader>
            <CardTitle>版本資訊</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-5">
              <Field label="更新日期" htmlFor="system-update-time" className="w-[300px] max-w-full">
                <Input
                  id="system-update-time"
                  type="date"
                  value={format(updateRecord.updateTime, 'yyyy-MM-dd')}
                  onChange={event => {
                    setUpdateRecord({
                      ...updateRecord,
                      updateTime: new Date(event.target.value).getTime(),
                    })
                  }}
                />
              </Field>
              <Field label="版本" htmlFor="system-update-version" className="w-[300px] max-w-full">
                <Input
                  id="system-update-version"
                  type="text"
                  onChange={event => {
                    setUpdateRecord({ ...updateRecord, versionNo: event.target.value })
                  }}
                />
              </Field>
            </div>
            <Field label="標題" htmlFor="system-update-title">
              <Input
                id="system-update-title"
                type="text"
                onChange={event => {
                  setUpdateRecord({ ...updateRecord, title: event.target.value })
                }}
              />
            </Field>
          </CardContent>
        </div>
        <div className="px-5 pb-5">
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
        </div>
      </Card>
      <div className="ui-root">
        <Button
          variant="primary"
          data-testid="createSystemUpdate"
          onClick={onSubmit}
          disabled={enable}
        >
          新增
        </Button>
      </div>
    </Fragment>
  )
}

export default General
