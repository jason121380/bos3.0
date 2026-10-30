import Page from 'components/Page'
import { CircleCheck, CircleX } from 'lucide-react'

const Status = ({ isSuccess = false }) => {
  return (
    <Page className="ui-root" title="BeautyOS+">
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        {isSuccess ? (
          <CircleCheck className="check h-24 w-24 text-success" strokeWidth={1.5} />
        ) : (
          <CircleX className="close h-24 w-24 text-danger" strokeWidth={1.5} />
        )}
        <p className="text-title !font-bold text-text">
          {isSuccess ? (
            <>
              您已填寫完成
              <br />
              謝謝
            </>
          ) : (
            '該店未開放此功能'
          )}
        </p>
      </div>
    </Page>
  )
}

export default Status
