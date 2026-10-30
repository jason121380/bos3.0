import useFetchProfile from 'hooks/useFetchProfile'
import idx from 'idx'
import PropTypes from 'prop-types'
import React from 'react'
import { cn } from 'ui/utils'

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
    <div {...rest} className={cn('grid grid-cols-12 gap-6', className)}>
      {idx(profile.data, _ => (
        <React.Fragment>
          <div className="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3">
            <ProfileDetails
              profile={_.me}
              refetchProfile={profile.refetch}
              // themeChange={themeChange}
              // setThemeChange={setThemeChange}
              // handleThemeChange={handleThemeChange}
              // getTheme={userDetail.data.user.theme}
            />
          </div>
          <div className="col-span-12 md:col-span-6 lg:col-span-8 xl:col-span-9">
            <GeneralSettings
              profile={_.me}
              refetchProfile={profile.refetch}
              // themeChange={themeChange}
              // setThemeChangeData={setThemeChangeData}
            />
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

General.propTypes = {
  className: PropTypes.string,
}

export default General
