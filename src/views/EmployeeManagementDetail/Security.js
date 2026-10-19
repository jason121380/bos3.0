import { openSnackbar } from 'elements/snackbars'
import useFetchChangePassword from 'hooks/useFetchChangePassword'
import { useState, useContext, useEffect } from 'react'
import designerContext from 'context/designerContext'
import idx from 'idx'
import { useFetchMerchantAuthoritiesNameAndId } from 'hooks/useFetchGetMerchantAuthorities'
import useFetchUpdateUserMerchantIdentity from 'hooks/useFetchUpdateUserMerchantIdentity'
import produce from 'immer'
import useFetchUserGeneral from 'hooks/useFetchUserGeneral'
import { useHistory } from 'react-router'
import { Button } from 'ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'

const accountStatus = [
  {
    value: 'ok',
    label: '可登入',
  },
  {
    value: 'banned',
    label: '不可登入',
  },
]

const cellphoneLogin = [
  {
    value: true,
    label: '可登入',
  },
  {
    value: false,
    label: '不可登入',
  },
]

function Security({ designerId, refetch, ...rest }) {
  const authoritiesNameAndIdData = useFetchMerchantAuthoritiesNameAndId()
  const { fetchUpdateUserGeneral } = useFetchUserGeneral()
  const { updateUserMerchantIdentity } = useFetchUpdateUserMerchantIdentity()

  const history = useHistory()

  const { designer } = useContext(designerContext)
  const [values, setValues] = useState({
    password: '',
    confirm: '',
  })

  const [designerSetting, setDesignerSetting] = useState({
    status: '',
    firstName: '',
    lastName: '',
    merchantIdentity: '',
    isCellphoneLogin: false,
  })

  const handleOnChange = event => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    })
  }

  // const valid = values.password && values.password === values.confirm

  useEffect(() => {
    if (!designer.loading) {
      setDesignerSetting(pre => {
        return {
          ...pre,
          status: idx(designer, _ => (_.status === 'pending' ? 'ok' : _.status)),
          firstName: idx(designer, _ => _.firstName),
          lastName: idx(designer, _ => _.lastName),
          merchantIdentity: idx(designer, _ => _.merchantIdentity.authorityId),
          isCellphoneLogin: idx(designer, _ => _.isCellphoneLogin),
        }
      })
    }
  }, [designer.loading])

  const handleDesignerSettingChange = ({ key, value }) => {
    setDesignerSetting(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  const { changePassword } = useFetchChangePassword()
  const handleOnChangePassword = () => {
    const updateStatus = {
      userId: designer.id,
      status: designerSetting.status,
      firstName: designerSetting.firstName,
      lastName: designerSetting.lastName,
      isCellphoneLogin: designerSetting.isCellphoneLogin,
    }
    if (values.password.length > 0 && values.confirm.length > 0) {
      changePassword({
        password: values.password,
        secondPassword: values.confirm,
        userId: designerId,
      }).then(() => {
        fetchUpdateUserGeneral(updateStatus).then(designer => {
          if (designer.status === 'banned' && designer.id === designerId) {
            openSnackbar({ message: '已將此帳號設為停用', variant: 'error' })
            const timeout = setTimeout(() => {
              localStorage.clear()
              history.push('/auth/login')
              clearTimeout(timeout)
            }, 150)
          }
        })
        updateUserMerchantIdentity({
          designerId: designer.id,
          MerchantUserAuthorityId: designerSetting.merchantIdentity,
        }).then(() => {
          openSnackbar({ message: '更新成功', variant: 'success' })
          window.location.href = '/management/employee'
        })
      })
    } else {
      fetchUpdateUserGeneral(updateStatus).then(designer => {
        if (designer.status === 'banned' && designer.id === designerId) {
          openSnackbar({ message: '已將此帳號設為停用', variant: 'error' })
          const timeout = setTimeout(() => {
            localStorage.clear()
            history.push('/auth/login')
            clearTimeout(timeout)
          }, 150)
        } else {
          refetch()
          openSnackbar({ message: '更新成功', variant: 'success' })
          window.location.href = '/management/employee'
        }
      })
      updateUserMerchantIdentity({
        designerId: designer.id,
        MerchantUserAuthorityId: designerSetting.merchantIdentity,
      }).then(() => {
        openSnackbar({ message: '更新成功', variant: 'success' })
        window.location.href = '/management/employee'
      })
    }
  }
  return (
    <Card {...rest}>
      <CardHeader>
        <CardTitle>更改密碼</CardTitle>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Field label="密碼" htmlFor="security-password">
              <Input
                id="security-password"
                name="password"
                onChange={handleOnChange}
                type="password"
                value={values.password}
              />
            </Field>
            <Field label="確認密碼" htmlFor="security-confirm">
              <Input
                id="security-confirm"
                name="confirm"
                onChange={handleOnChange}
                type="password"
                value={values.confirm}
              />
            </Field>
          </div>
        </form>
      </CardContent>
      <CardContent className="pt-0">
        <form>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Field label='帳號狀態'>
              <NativeSelect
                value={designerSetting.status === 'pending' ? 'ok' : designerSetting.status}
                onChange={event =>
                  handleDesignerSettingChange(
                    idx(event, _ => ({ value: _.target.value, key: 'status' }))
                  )
                }
              >
                {accountStatus.map((data, idx) => (
                  <NativeSelectOption value={data.value} key={`${data.label}-${idx}`}>
                    {data.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field label='權限設定'>
              <NativeSelect
                value={designerSetting.merchantIdentity}
                onChange={event =>
                  handleDesignerSettingChange(
                    idx(event, _ => ({ value: _.target.value, key: 'merchantIdentity' }))
                  )
                }
              >
                {!authoritiesNameAndIdData.loading &&
                  idx(authoritiesNameAndIdData, _ =>
                    _.data.getMerchantAuthorities.map((data, idx) => (
                      <NativeSelectOption value={data.id} key={`${data.authorityName}-${idx}`}>
                        {data.authorityName}
                      </NativeSelectOption>
                    ))
                  )}
              </NativeSelect>
            </Field>
          </div>
        </form>
      </CardContent>
      <CardContent className="pt-0">
        <form>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Field label='允許登入設計師手機端'>
              <NativeSelect
                value={designerSetting.isCellphoneLogin}
                onChange={event =>
                  handleDesignerSettingChange(
                    idx(event, _ => ({ value: _.target.value, key: 'isCellphoneLogin' }))
                  )
                }
              >
                {cellphoneLogin.map((data, idx) => (
                  <NativeSelectOption value={data.value} key={`${data.label}-${idx}`}>
                    {data.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          // disabled={!valid}
          variant="primary"
          onClick={handleOnChangePassword}
        >
          儲存並返回列表
        </Button>
      </CardFooter>
    </Card>
  )
}

export default Security
