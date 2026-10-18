import { CheckboxField } from 'ui/checkbox'
import { openSnackbar } from 'elements/snackbars'
import { useFetchMerchantPermission } from 'hooks/useFetchMerchant'
import { useFetchMePermissions } from 'hooks/useFetchProfile'
import { useUpdateUserPermission } from 'hooks/useFetchUser'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'

function CheckBoxCus({ action, defaultChecked }) {
  const { updateUserPermission } = useUpdateUserPermission({
    input: {},
  })
  return (
    <CheckboxField
      className="py-1"
      defaultChecked={defaultChecked}
      onChange={async event => {
        const resp = await updateUserPermission({
          input: {
            userId: JSON.parse(localStorage.getItem('user')).id,
            permissionActionId: action.id,
            status: event.target.checked,
          },
        })
        if (resp && resp.data) {
          if (resp.data.updateUserPermission) {
            openSnackbar({ message: '新增成功', variant: 'success' })
          } else {
            openSnackbar({ message: '刪除成功', variant: 'success' })
          }
        }
      }}
      label={action.name}
    />
  )
}

function Permission({ ...rest }) {
  const apiResp = useFetchMerchantPermission()
  const apiUserPermissions = useFetchMePermissions()

  const [permissions, setPermissions] = useState([])
  const [userPermisions, setUserPermissions] = useState([])
  useEffect(() => {
    if (apiResp.data) {
      setPermissions(apiResp.data.merchant.permissions)
    }
  }, [apiResp])
  useEffect(() => {
    if (apiUserPermissions.data) {
      setUserPermissions(apiUserPermissions.data.me.permissionActions.map(d => d.id))
    }
  }, [apiUserPermissions])

  return (
    <Card {...rest}>
      <CardHeader>
        <CardTitle>權限設定</CardTitle>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {permissions.map(permission => {
              return (
                <div key={permission.id} className="flex flex-col">
                  <h4 className="pb-1 text-heading text-text">
                    {permission.name}
                  </h4>
                  {permission.actions.map(action => {
                    const isChecked = !!userPermisions.find(d => d === action.id)
                    return (
                      <CheckBoxCus
                        key={`${action.id}_${isChecked}`}
                        action={action}
                        defaultChecked={isChecked}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default Permission
