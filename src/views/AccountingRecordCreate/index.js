import Page from 'components/Page'
import { useState } from 'react'
import { Checkbox } from 'ui/checkbox'
import { PageHeader } from 'ui/page-header'

import General from './General'

export default function AccountingRecordCreate() {
  const stayInCreateAccountInMemory = JSON.parse(localStorage.getItem('stayInCreateAccount'))
  const [stayInCreateAccount, setStayInCreateAccount] = useState(
    stayInCreateAccountInMemory !== null ? stayInCreateAccountInMemory : false
  )
  const handleStayInCreateAccount = () => {
    if (!stayInCreateAccount) {
      setStayInCreateAccount(true)
      localStorage.setItem('stayInCreateAccount', true)
    } else {
      localStorage.removeItem('stayInCreateAccount')
      setStayInCreateAccount(false)
    }
  }
  return (
    <Page className="ui-root" title="新增收借支紀錄">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="新增收借支紀錄"
          actions={
            <label className="flex cursor-pointer items-center gap-2 text-body text-text">
              <Checkbox
                checked={stayInCreateAccount}
                onChange={handleStayInCreateAccount}
              />
              連續新增收借支
            </label>
          }
        />
        <General stayInCreateAccount={stayInCreateAccount} />
      </div>
    </Page>
  )
}
