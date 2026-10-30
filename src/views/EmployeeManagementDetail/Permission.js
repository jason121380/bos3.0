import { CheckboxField } from 'ui/checkbox'
import { openSnackbar } from 'elements/snackbars'
import { useFetchMerchantPermission } from 'hooks/useFetchMerchant'
// import { useFetchMePermissions } from 'hooks/useFetchProfile'
import { useFetchUserPermission, useUpdateUserPermission } from 'hooks/useFetchUser'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'

function CheckBoxCus({ designerId, action, defaultChecked }) {
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
            userId: designerId,
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

function Permission({ designerId, className = '', ...rest }) {
  const apiResp = useFetchMerchantPermission()
  const apiUserPermissions = useFetchUserPermission({
    input: {
      id: designerId,
    },
  })

  const [permissions, setPermissions] = useState([])
  const [userPermisions, setUserPermissions] = useState([])
  useEffect(() => {
    if (apiResp.data) {
      setPermissions(apiResp.data.merchant.permissions)
    }
  }, [apiResp])
  useEffect(() => {
    if (apiUserPermissions.data) {
      setUserPermissions(apiUserPermissions.data.user.permissionActions.map(d => d.id))
    }
  }, [apiUserPermissions])

  return (
    <Card {...rest} className={className}>
      <CardHeader>
        <CardTitle>權限設定</CardTitle>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
            {permissions.map(permission => {
              return (
                <div key={permission.id} className="flex flex-col">
                  <h4 className="mb-1 text-heading text-text">{permission.name}</h4>
                  {permission.actions.map(action => {
                    const isChecked = !!userPermisions.find(d => d === action.id)
                    return <CheckBoxCus key={`${action.id}_${isChecked}`} designerId={designerId} action={action} defaultChecked={isChecked} />
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

Permission.propTypes = {
  className: PropTypes.string,
}

export default Permission
