/** @jsxImportSource @emotion/react */
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material'
import { openSnackbar } from 'elements/snackbars'
import useFetchHeadQuartersDepartment from 'hooks/useFetchHeadQuartersDepartment'
import useFetchHeadQuartersJobTitle from 'hooks/useFetchHeadQuartersJobTitle'
import useFetchMerchantDepartment from 'hooks/useFetchMerchantDepartment'
import useFetchMerchantJobTitle from 'hooks/useFetchMerchantJobTitle'
import useFetchProfile from 'hooks/useFetchProfile'
import useFetchUpdateGroup from 'hooks/useFetchUpdateGroup'
import useFetchUserMerchant from 'hooks/useFetchUserMerchant'
import useInitProfileGroupData from 'hooks/useInitProfileGroupData'
import idx from 'idx'
import produce from 'immer'
import { useState } from 'react'
import { css } from '@emotion/react'

const styles = {
  root: css({}),
  removeBotton: css({
    width: '100%',
  }),
  formControl: css({
    width: '100%',
  }),
}

const group = [
  {
    name: '總部',
    value: 1,
  },
  {
    name: '地方',
    value: 2,
  },
]
export default function Merchant({ rest, className }) {
  const fetchHQDepartment = useFetchHeadQuartersDepartment()
  const fetchMerchantDepartment = useFetchMerchantDepartment()
  const fetchMerchantJobTitle = useFetchMerchantJobTitle()
  const fetchHQJobTitle = useFetchHeadQuartersJobTitle()
  const profile = useFetchProfile()
  const fetchUpdateGroup = useFetchUpdateGroup()
  const fetchMerchents = useFetchUserMerchant()

  const [groupData, setGroupData] = useState({
    groupId: 0,
    userGroupId: 0,
    jobTitleId: 0,
    merchantIds: [],
  })
  const handleSelectChange = ({ name, event }) => {
    switch (name) {
      case 'groupId':
        setGroupData(
          produce(data => {
            data.groupId = event.target.value
            data.jobTitleId = 0
            data.userGroupId = 0
            data.merchantIds = []
          })
        )
        break
      case 'jobTitleId':
        setGroupData(
          produce(data => {
            data.jobTitleId = event.target.value
            data.merchantIds = []
          })
        )
        break
      case 'userGroupId':
        setGroupData(
          produce(data => {
            data.userGroupId = event.target.value
            data.jobTitleId = 0
            data.merchantIds = []
          })
        )
        break
      case 'merchantIds':
        setGroupData(
          produce(data => {
            data.merchantIds = event.target.value
          })
        )
        break
      default:
        setGroupData(
          produce(data => {
            data[name] = event.target.value
          })
        )
        break
    }
  }
  useInitProfileGroupData({
    profile,
    group,
    fetchHQDepartment,
    fetchMerchantDepartment,
    setGroupData,
    fetchMerchantJobTitle,
    fetchHQJobTitle,
  })

  const vaild =
    groupData.groupId === 0 ||
    groupData.jobTitleId === 0 ||
    groupData.userGroupId === 0 ||
    (groupData.merchantIds.length === 0 && groupData.groupId === 2)
  const handleSaveChange = () => {
    const { jobTitleId, userGroupId, merchantIds } = groupData
    fetchUpdateGroup
      .fetch({
        userId: idx(profile.data, _ => _.me.id),
        jobTitleId,
        userGroupId,
        merchantIds,
      })
      .then(() => {
        openSnackbar({ message: '儲存成功', variant: 'success' })
        profile.refetch()
        fetchMerchents.refetch()
      })
  }
  return (
    <Card {...rest} css={css([styles.root, className])}>
      <CardHeader title="店家/總部資訊" />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item md={4} sm={6} xs={12}>
            <FormControl css={styles.formControl}>
              <InputLabel id="group-select-label">群組</InputLabel>
              <Select
                labelId="group-select-label"
                id="group-select"
                value={groupData.groupId}
                onChange={event => handleSelectChange({ event, name: 'groupId' })}
              >
                <MenuItem value={0}>選擇群組</MenuItem>
                {group.map((data, idx) => (
                  <MenuItem value={data.value} key={`group-${idx}`}>
                    {data.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item md={4} sm={6} xs={12}>
            {groupData.groupId === 1 ? (
              <FormControl css={styles.formControl}>
                <InputLabel id="headquarters-department-select-label">部門</InputLabel>
                <Select
                  labelId="headquarters-department-select-label"
                  id="headquarters-department-select"
                  value={groupData.userGroupId}
                  onChange={event => handleSelectChange({ event, name: 'userGroupId' })}
                >
                  <MenuItem value={0}>選擇部門</MenuItem>
                  {idx(fetchHQDepartment.data, _ =>
                    _.userGroup.map((data, idx) => (
                      <MenuItem key={`HQdepartment-${idx}`} value={data.id}>
                        {data.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            ) : (
              <FormControl css={styles.formControl}>
                <InputLabel id="merchant-department-select-label">事業部</InputLabel>
                <Select
                  labelId="merchant-department-select-label"
                  id="merchant-department-select"
                  value={groupData.userGroupId}
                  onChange={event => handleSelectChange({ event, name: 'userGroupId' })}
                >
                  <MenuItem value={0}>選擇事業部</MenuItem>
                  {idx(fetchMerchantDepartment.data, _ =>
                    _.userGroup.map((data, idx) => (
                      <MenuItem key={`merchantDepartment-${idx}`} value={data.id}>
                        {data.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            )}
          </Grid>
          <Grid item md={4} sm={6} xs={12}>
            <FormControl css={styles.formControl}>
              <InputLabel id="jobTitle-open-select-label">職稱</InputLabel>
              <Select
                value={groupData.jobTitleId}
                onChange={event => handleSelectChange({ event, name: 'jobTitleId' })}
                labelId="jobTitle-open-select-label"
                id="jobTitle-open-select"
              >
                <MenuItem value={0}>選擇職稱</MenuItem>
                {groupData.groupId === 2
                  ? idx(fetchMerchantJobTitle.data, _ =>
                      _.jobTitle
                        .sort((a, b) => a.sorting - b.sorting)
                        .map((data, idx) => (
                          <MenuItem value={data.id} key={`jobTitle-${idx}`}>
                            {data.name}
                          </MenuItem>
                        ))
                    )
                  : idx(fetchHQJobTitle.data, _ =>
                      _.jobTitle
                        .sort((a, b) => a.sorting - b.sorting)
                        .map((data, idx) => (
                          <MenuItem value={data.id} key={`jobTitle-${idx}`}>
                            {data.name}
                          </MenuItem>
                        ))
                    )}
              </Select>
            </FormControl>
          </Grid>
          {groupData.groupId === 2 ? (
            <Grid item md={4} sm={6} xs={12}>
              <FormControl css={styles.formControl}>
                <InputLabel id="merchant-open-select-label">店家</InputLabel>
                <Select
                  multiple={idx(fetchMerchantJobTitle.data, _ =>
                    _.jobTitle.some(data =>
                      data.id === groupData.jobTitleId ? data.remark === 'multiple' : false
                    )
                  )}
                  value={groupData.merchantIds}
                  labelId="merchant-open-select-label"
                  id="merchant-open-select"
                  onChange={event => handleSelectChange({ event, name: 'merchantIds' })}
                >
                  <MenuItem value={''}>選擇店家</MenuItem>
                  {idx(fetchMerchantDepartment.data, _ =>
                    _.userGroup.map(department => {
                      let merchant = []
                      merchant = merchant.concat(department.merchants)
                      department.groups.map(area => (merchant = merchant.concat(area.merchants)))
                      return merchant
                        .sort((a, b) => b.name - a.name)
                        .map((data, idx) => (
                          <MenuItem value={data.id} key={`merchants-${idx}`}>
                            {data.name}
                          </MenuItem>
                        ))
                    })
                  )}
                </Select>
              </FormControl>
            </Grid>
          ) : (
            ''
          )}
        </Grid>
      </CardContent>
      <Divider />
      <CardActions>
        <Button
          css={styles.saveButton}
          variant="contained"
          onClick={handleSaveChange}
          disabled={vaild}
        >
          儲存變更
        </Button>
      </CardActions>
    </Card>
  )
}
