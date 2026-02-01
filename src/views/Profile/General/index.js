/** @jsxImportSource @emotion/react */
import { Grid } from '@mui/material'
import useFetchProfile from 'hooks/useFetchProfile'
import idx from 'idx'
import PropTypes from 'prop-types'
import React from 'react'

import GeneralSettings from './GeneralSettings'
import ProfileDetails from './ProfileDetails'
// import useFetchSettingTheme from 'hooks/useFetchSettingTheme'

function General({ className, ...rest }) {
  const profile = useFetchProfile()
  // const userDetail = useFetchUser({ id: idx(profile.data, _ => _.me.id) })
  // const { setThemeChangeData } = useFetchSettingTheme()
  // const [themeChange, setThemeChange] = React.useState({
  //   theme: userDetail.data !== undefined && userDetail.data.user.theme,
  // })
  // const handleThemeChange = ({ key, value }) => {
  //   setThemeChange(
  //     produce(draft => {
  //       draft[key] = value
  //     })
  //   )
  // }
  return (
    <Grid {...rest} css={className} container spacing={3}>
      {idx(profile.data, _ => (
        <React.Fragment>
          <Grid item lg={4} md={6} xl={3} xs={12}>
            <ProfileDetails
              profile={_.me}
              // themeChange={themeChange}
              // setThemeChange={setThemeChange}
              // handleThemeChange={handleThemeChange}
              // getTheme={userDetail.data.user.theme}
            />
          </Grid>
          <Grid item lg={8} md={6} xl={9} xs={12}>
            <GeneralSettings
              profile={_.me}
              refetchProfile={profile.refetch}
              // themeChange={themeChange}
              // setThemeChangeData={setThemeChangeData}
            />
          </Grid>
        </React.Fragment>
      ))}
    </Grid>
  )
}

General.propTypes = {
  className: PropTypes.object,
}

export default General
