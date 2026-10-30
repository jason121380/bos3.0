import idx from 'idx'
import PropTypes from 'prop-types'
import React from 'react'
import { Avatar } from 'ui/avatar'
import { Badge } from 'ui/badge'
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { cn } from 'ui/utils'
import lineAppLogo from 'assets/images/LINE_APP.png'
import lineBlackLogo from 'assets/images/LINE_BLACK_LOGO.png'

function ProfileDetails({ profile, avatar, isLineBinded, merchantIdentity, onEmployeeResign, onSubmit, ...rest }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-5 px-6 py-5">
        <Avatar className="h-20 w-20" src={profile.avatar} />
        <div className="flex flex-1 flex-wrap items-center gap-4">
          <h2 className="m-0 whitespace-nowrap text-heading text-text">{idx(profile, _ => _.firstName + ' ' + _.lastName)}</h2>
          <span className="whitespace-nowrap text-label text-text-secondary">
            {merchantIdentity.authorityName.length > 0 ? merchantIdentity.authorityName : '權限未設定'}
          </span>
          <span className="whitespace-nowrap text-caption text-text-tertiary">{idx(profile, _ => _.jobTitle || '-')}</span>
          <Badge variant={isLineBinded ? 'success' : 'neutral'} className="gap-1.5 rounded-full px-3">
            <img className={cn('h-4 w-4', !isLineBinded && 'opacity-40')} alt="line" src={isLineBinded ? lineAppLogo : lineBlackLogo} />
            <span>{isLineBinded ? 'LINE 已綁定' : 'LINE 未綁定'}</span>
          </Badge>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" onClick={onEmployeeResign}>
            辦理員工離職
          </Button>
          <Button variant="primary" onClick={onSubmit}>
            儲存
          </Button>
        </div>
      </div>
    </Card>
  )
}

ProfileDetails.propTypes = {
  profile: PropTypes.object.isRequired,
}

export default ProfileDetails
