import Page from 'components/Page'
import { Helmet } from 'react-helmet'

export default function Employees() {
  return (
    <Page className="text-center" title="AR變髮色">
      <Helmet>
        <title>AR 變髮色</title>
      </Helmet>
      {/* 原 Container maxWidth={false}：滿版、左右內距 16／24px（600px 起） */}
      <div className="mx-auto box-border block w-full px-4 pb-6 pt-10 min-[600px]:px-6">
        系統優化中
      </div>
    </Page>
  )
}
