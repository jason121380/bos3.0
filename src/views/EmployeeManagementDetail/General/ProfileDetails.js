/** @jsxImportSource @emotion/react */
import {
  Avatar,
  Card,
  CardActions,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  FormControlLabel,
  Checkbox,
  Grid,
  TextField,
  CardHeader,
} from '@mui/material'
import idx from 'idx'
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import { cloneDeep } from 'lodash'
import useFetchMerchantJobTitlePoint from 'hooks/useFetchMerchantJobTitlePoint'
import { css } from '@emotion/react'
import { theme } from '../../../theme'

const styles = {
  root: css({}),
  content: css({
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    textAlgin: 'center',
  }),
  name: css({
    marginTop: theme.spacing(1) + '!important',
  }),
  avatar: css({
    height: 100,
    width: 100,
  }),
  action: css({
    width: '100%',
  }),
  lineLogo: css({
    width: '30px',
    marginRight: '3px',
  }),
  lineOfflineLogo: css({
    width: '30px',
    marginRight: '3px',
    opacity: '0.4',
  }),
  lineLogoAndId: css({
    display: 'flex',
    alignItems: 'center',
  }),
  lineAccountId: css({
    wordBreak: 'break-all',
    textAlign: 'center',
  }),
  spanFont: css({
    fontSize: '10px',
    color: 'grey',
  }),
  newAddCard: css({
    marginTop: '30px',
  }),
  secondContent: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),
  icons: css({
    cursor: 'pointer',
  }),
  iconsGrid: css({
    display: 'flex',
    alignItems: 'center',
    padding: 0,
  }),
}

function ProfileDetails({
  itemAuthority,
  profile,
  onChange,
  avatar,
  identity,
  lineAccountId,
  isLineBinded,
  userMerchantIdentity,
  setUserMerchantIdentity,
  userDisplaySituationState,
  setUserDisplaySituationState,
  merchantIdentity,
  bookingLimitInput,
  handleBookingLimit,
  profitSharing,
  handleSalesWayChange,
  setProfitSharing,
  merchantDesigner,
  setThemeChange,
  themeChange,
  handleThemeChange,
  getTheme,
  ...rest
}) {
  const merchantId = localStorage.getItem('userMerchant')
    ? JSON.parse(localStorage.getItem('userMerchant')).id
    : null
  const merchantJobTitlePointData = useFetchMerchantJobTitlePoint({ merchantId })
  React.useEffect(() => {
    if (!merchantJobTitlePointData.loading) {
      let merchantJobTitlePointId = ''
      const merchantJobTitlePoints = idx(
        merchantJobTitlePointData,
        _ => _.data.merchantJobTitlePoint
      )
      if (merchantJobTitlePoints.length > 0) {
        merchantJobTitlePoints.forEach(data => {
          if (data.jobTitle === '設計師') {
            merchantJobTitlePointId = data.id
          }
        })
      }

      setProfitSharing({
        userId: merchantDesigner.id,
        MerchantJobTitlePointId:
          merchantDesigner.userCategory !== null
            ? merchantDesigner.userCategory.id
            : merchantJobTitlePointId,
        deductionWay:
          merchantDesigner.deductionWay !== null ? merchantDesigner.deductionWay : '無扣項',
      })
    }
  }, [merchantJobTitlePointData.loading])

  const handleUserIdentityChange = key => {
    const newSetting = cloneDeep(userDisplaySituationState)
    newSetting[key] = !newSetting[key]
    setUserDisplaySituationState(newSetting)
  }

  return (
    <Fragment>
      <Card {...rest} css={styles.root}>
        <CardContent css={styles.content}>
          <Avatar
            css={styles.avatar}
            src={profile.avatar}
          />
          <Typography css={styles.name} gutterBottom variant="h3">
            {idx(profile, _ => _.lastName + _.firstName)}
          </Typography>
          <Typography color="textSecondary" variant="body1">
            {merchantIdentity.authorityName.length > 0
              ? merchantIdentity.authorityName
              : '權限未設定'}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {idx(profile, _ => _.jobTitle)}
          </Typography>
          <div css={styles.lineLogoAndId}>
            <img
              css={isLineBinded ? styles.lineLogo : styles.lineOfflineLogo}
              alt="lineAccountId"
              src={require(`assets/images/${isLineBinded ? 'LINE_APP' : 'LINE_BLACK_LOGO'
                }.png`)}
            />
            <Typography css={styles.lineAccountId} color="textSecondary" variant="body1">
              {isLineBinded ? '有綁定' : '無綁定'}
            </Typography>
          </div>
        </CardContent>
        <CardActions style={{ padding: 16 }}>
          <div>
            <div>設置</div>
            <div>
              <FormControlLabel
                control={<Checkbox color="primary" />}
                label="出現於打單"
                checked={userDisplaySituationState.isDisplayOnServiceList}
                onChange={() => handleUserIdentityChange('isDisplayOnServiceList')}
              />
            </div>
            <div>
              <FormControlLabel
                control={<Checkbox color="primary" />}
                label="出現於預約列表"
                checked={userDisplaySituationState.isDisplayOnBookingRecord}
                onChange={() => handleUserIdentityChange('isDisplayOnBookingRecord')}
              />
            </div>
            <div>
              <FormControlLabel
                control={<Checkbox color="primary" />}
                label="可以被顧客預約"
                checked={userDisplaySituationState.isDisplayOnBookingList}
                onChange={() => handleUserIdentityChange('isDisplayOnBookingList')}
              />
            </div>
            <div>
              <FormControlLabel
                control={<Checkbox color="primary" />}
                label="出現於業績相關報表"
                checked={userDisplaySituationState.isDisplayOnPerformanceList}
                onChange={() => handleUserIdentityChange('isDisplayOnPerformanceList')}
              />
            </div>
            <div>
              {/* 薪資 */}
              <FormControlLabel
                control={<Checkbox color="primary" />}
                label="出現於薪資相關報表"
                checked={userDisplaySituationState.isDisplayOnSalaryReportList}
                onChange={() => handleUserIdentityChange('isDisplayOnSalaryReportList')}
              />
            </div>
            <div>
              {/* 打卡 */}
              <FormControlLabel
                control={<Checkbox color="primary" />}
                label="出現於考勤排班/打卡相關報表"
                checked={userDisplaySituationState.isDisplayOnClockInReportList}
                onChange={() => handleUserIdentityChange('isDisplayOnClockInReportList')}
              />
            </div>
          </div>
        </CardActions>
      </Card>
      <Card {...rest} css={styles.newAddCard}>
        <CardHeader title="手機端設定" />
        <CardContent css={styles.content}>
          <Grid container spacing={4}>
            <Grid item md={12} css={styles.action}>
              <TextField
                fullWidth
                label="同時段預約人數上限"
                type="number"
                name="bookingLimit"
                onChange={event =>
                  handleBookingLimit(
                    idx(event, _ => ({ value: parseInt(_.target.value), key: _.target.name }))
                  )
                }
                value={bookingLimitInput.bookingLimit !== null ? bookingLimitInput.bookingLimit : 3}
                variant="outlined"
                onWheel={() => document.activeElement.blur()}
              />
            </Grid>
            <Grid item md={12} css={styles.action}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel>是否開啟預約審核</InputLabel>
                <Select
                  label='是否開啟預約審核'
                  value={profile.isBookingAutoAccept}
                  onChange={event =>
                    onChange({
                      value: idx(event, _ => _.target.value),
                      key: 'isBookingAutoAccept',
                    })
                  }
                >
                  <MenuItem value="TRUE">開啟</MenuItem>
                  <MenuItem value="FALSE">關閉</MenuItem>
                  <MenuItem value="BYSTORE">依店家設定</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item md={12} css={styles.action} style={{ paddingTop: 0 }}>
              <FormControlLabel
                control={<Checkbox color="primary" />}
                style={{ whiteSpace: 'nowrap' }}
                label="待審核預約是否占用預約名額"
                checked={profile.isRTCO}
                onChange={event =>
                  onChange({
                    value: !profile.isRTCO,
                    key: 'isRTCO',
                  })
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Fragment>
  )
}

ProfileDetails.propTypes = {
  profile: PropTypes.object.isRequired,
}

export default ProfileDetails
