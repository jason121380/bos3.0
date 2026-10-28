import { Button } from 'ui/button'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

function AccountingSubjectModal({
  openAccountingSubjectModal,
  accountingSubject,
  closeModal,
  inoutType,
  setAccountingSubjects,
  setInoutType,
}) {
  const handleSelectAccountingSubject = subject => {
    setAccountingSubjects(subject)
    setInoutType(inoutType)
    closeModal()
  }
  return (
    // 舊版 Modal 未設定 onClose（點背景／Esc 不關閉），故不傳 onOpenChange；以「關閉」按鈕關閉
    <Dialog open={openAccountingSubjectModal}>
      <DialogContent size="lg" hideClose aria-describedby={undefined}>
        <DialogHeader className="flex-row items-center justify-between pr-6">
          <DialogTitle>{inoutType === 'REVENUE' ? '收入科目' : '支出科目'}</DialogTitle>
          <Button variant="secondary" size="sm" onClick={closeModal}>
            關閉
          </Button>
        </DialogHeader>
        <DialogBody>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[88px]" />
                <TableHead>代號</TableHead>
                <TableHead>名稱</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountingSubject.map((subject, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSelectAccountingSubject(subject)}
                    >
                      選擇
                    </Button>
                  </TableCell>
                  <TableCell className="tabular-nums">{subject.number}</TableCell>
                  <TableCell>{subject.title}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={closeModal}>
            關閉
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AccountingSubjectModal
