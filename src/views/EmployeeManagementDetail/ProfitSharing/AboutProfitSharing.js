/** @jsxImportSource @emotion/react */
import { Table, TableBody, TableCell, TableRow } from 'ui/table-compat'
import { Grid } from 'ui/grid-compat'
import { Card, CardContent, CardHeader } from 'ui/card-compat'
import { FormControl, InputLabel, MenuItem, Select } from 'ui/form-control'
import { TextField } from 'ui/text-field'
import useFetchMerchantCommissionWay from 'hooks/useFetchMerchantCommissionWay'
import idx from 'idx'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import { css } from '@emotion/react'
import { theme } from '../../../theme'
// import { useFetchMerchantAuthoritiesNameAndId } from 'hooks/useFetchGetMerchantAuthorities'

const styles = {
  root: css({}),
  alert: css({
    marginBottom: theme.spacing(3),
  }),
  formGroup: css({
    marginBottom: theme.spacing(3),
  }),
  action: css({
    width: '100%',
  }),
}

// const accountStatus = [
//   {
//     value: 'ok',
//     label: '可登入',
//   },
//   {
//     value: 'banned',
//     label: '不可登入',
//   },
// ]

// const userMerchantIdentityArr = [
//   {
//     value: 'DESIGNER',
//     label: '服務人員',
//   },
//   {
//     value: 'MID_LEVEL_SUPERVISOR',
//     label: '主管',
//   },
//   {
//     value: 'SENIOR_SUPERVISOR',
//     label: '高階主管',
//   },
// ]

function AboutProfitSharing({
  className,
  designer,
  profitSharing,
  merchantJobTitlePoints,
  onChange,
  handleBookingLimit,
  bookingLimit,
  designerSetting,
  handleDesignerSettingChange,
  ...rest
}) {
  // const authoritiesNameAndIdData = useFetchMerchantAuthoritiesNameAndId()
  const commissionWay = useFetchMerchantCommissionWay()

  return (
    <Card {...rest} css={css([styles.root, className])}>
      <CardHeader title="一般設定" />
      <Grid container>
        {/* <Grid item xs={12} sm={6}>
          <CardContent>
            <Table>
              <TableBody>
<CardActions>
                  <FormControl variant="outlined" className={classes.action}>
                    <InputLabel>帳號狀態</InputLabel>
                    <Select
                      label='帳號狀態'
                      value={designerSetting.status === 'pending' ? 'ok' : designerSetting.status}
                      onChange={event =>
                        handleDesignerSettingChange(
                          idx(event, _ => ({ value: _.target.value, key: 'status' }))
                        )
                      }
                    >
                      {accountStatus.map((data, idx) => (
                        <MenuItem value={data.value} key={`${data.label}-${idx}`}>
                          {data.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </CardActions>
                <CardActions>
                  <FormControl variant="outlined" className={classes.action}>
                    <InputLabel>權限設定</InputLabel>
                    <Select
                      label='權限設定'
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
                            <MenuItem value={data.id} key={`${data.authorityName}-${idx}`}>
                              {data.authorityName}
                            </MenuItem>
                          ))
                        )}
                    </Select>
                  </FormControl>
                </CardActions> 
<CardActions>
                  <div>
                    <div>設置</div>
                    <div>
                      <FormControlLabel
                        control={<Checkbox color="primary" />}
                        label="出現於打單/預約列表"
                        checked={designerSetting.isDisplayOnServiceList}
                        onChange={event =>
                          handleDesignerSettingChange(
                            idx(event, _ => ({
                              value: !designerSetting.isDisplayOnServiceList,
                              key: 'isDisplayOnServiceList',
                            }))
                          )
                        }
                      />
                    </div>
                    <div>
                      <FormControlLabel
                        control={<Checkbox color="primary" />}
                        label="可以被顧客預約"
                        checked={designerSetting.isDisplayOnBookingList}
                        onChange={event =>
                          handleDesignerSettingChange(
                            idx(event, _ => ({
                              value: !designerSetting.isDisplayOnBookingList,
                              key: 'isDisplayOnBookingList',
                            }))
                          )
                        }
                      />
                    </div>
                    <div>
                      <FormControlLabel
                        control={<Checkbox color="primary" />}
                        label="出現於報表列表"
                        checked={designerSetting.isDisplayOnPerformanceList}
                        onChange={event =>
                          handleDesignerSettingChange(
                            idx(event, _ => ({
                              value: !designerSetting.isDisplayOnPerformanceList,
                              key: 'isDisplayOnPerformanceList',
                            }))
                          )
                        }
                      />
                    </div>
                  </div>
                </CardActions> 
              </TableBody>
            </Table>
          </CardContent>
        </Grid> */}
        <Grid item xs={12} sm={6}>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>{designer.designerNo}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{designer.lastName + designer.firstName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel>服務扣項方式</InputLabel>
                      <Select
                        label='服務扣項方式'
                        value={profitSharing.deductionWay}
                        onChange={event =>
                          onChange({
                            value: idx(event, _ => _.target.value),
                            key: 'deductionWay',
                          })
                        }
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {idx(commissionWay, _ =>
                          _.data.merchantCommissionWay.map(data => (
                            <MenuItem key={data.name} value={data.name}>
                              {data.name}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel>互助點數設定依據</InputLabel>
                      <Select
                        label='互助點數設定依據'
                        value={
                          profitSharing.MerchantJobTitlePointId
                            ? profitSharing.MerchantJobTitlePointId
                            : ''
                        }
                        onChange={event =>
                          onChange({
                            value: idx(event, _ => _.target.value),
                            key: 'MerchantJobTitlePointId',
                          })
                        }
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {merchantJobTitlePoints?.map((data, index) => (
                          <MenuItem key={`${data.jobTitle}-${index}`} value={data.id}>
                            {data.jobTitle}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <TextField
                      fullWidth
                      label="指定同時段可預約人數"
                      type="number"
                      name="bookingLimit"
                      onChange={event =>
                        handleBookingLimit(
                          idx(event, _ => ({ value: parseInt(_.target.value), key: _.target.name }))
                        )
                      }
                      value={bookingLimit}
                      variant="outlined"
                      onWheel={() => document.activeElement.blur()}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  )
}

AboutProfitSharing.propTypes = {
  className: PropTypes.object,
}

export default AboutProfitSharing
