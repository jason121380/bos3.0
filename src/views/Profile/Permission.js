/** @jsxImportSource @emotion/react */
import {
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Typography,
  colors,
} from '@mui/material'
import { openSnackbar } from 'elements/snackbars'
import { useFetchMerchantPermission } from 'hooks/useFetchMerchant'
import { useFetchMePermissions } from 'hooks/useFetchProfile'
import { useUpdateUserPermission } from 'hooks/useFetchUser'
import { useEffect, useState } from 'react'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  item: css({
    display: 'flex',
    flexDirection: 'column',
  }),
  saveButton: css({
    color: theme.palette.common.white,
    backgroundColor: colors.green[600],
    '&:hover': {
      backgroundColor: colors.green[900],
    },
  }),
}

function CheckBoxCus({ action, defaultChecked }) {
  const { updateUserPermission } = useUpdateUserPermission({
    input: {},
  })
  return (
    <FormControlLabel
      control={
        <Checkbox
          color="primary"
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
        />
      }
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
    <Card {...rest} css={styles.root}>
      <CardHeader title="權限設定" />
      <Divider />
      <CardContent>
        <form>
          <Grid container spacing={6} wrap="wrap">
            {permissions.map(permission => {
              return (
                <Grid key={permission.id} css={styles.item} item md={4} sm={6} xs={12}>
                  <Typography gutterBottom variant="h6">
                    {permission.name}
                  </Typography>
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
                </Grid>
              )
            })}
          </Grid>
        </form>
      </CardContent>
      <Divider />
    </Card>
  )
}

export default Permission
