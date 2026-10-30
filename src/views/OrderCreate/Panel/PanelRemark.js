import { Card, CardContent } from 'ui/card'
import Remark from 'views/OrderShared/Remark'

const styles = {
  heading: '!text-[16px] font-bold text-[rgb(var(--text))] flex items-center',
  fieldOutter: 'flex justify-start items-start flex-col',
}

export default function PanelRemark({ expanded }) {

  return (
    <Card>
      <CardContent>
        <p className={`m-0 ${styles.heading}`} style={{ marginBottom: '12px', fontWeight: 'bold' }}>備註及來源</p>
        <div className={styles.fieldOutter}>
          <Remark expanded={expanded} />
        </div>
      </CardContent>
    </Card>
  )
}
