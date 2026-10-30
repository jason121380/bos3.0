import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from 'ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TablePagination } from 'ui/table'
import { Button } from 'ui/button'
import { ToggleGroupItem } from 'ui/toggle-group'
import { X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import pagenationLabel from 'helper/pagenationLabel'

// 帳單四兄弟「選服務／商品／卡券／會員卡」彈窗的共用畫面（2026/10/21 合併，原本四頁各一份、逐行相同）。
// 只負責畫面與純顯示的 state（分類標題、分頁文字）；選取後要送什麼、分類條件怎麼寫入查詢設定，
// 仍由呼叫端（OrderShared/ProductsModal 等）決定，各頁原本的 handler 一字未改。
// - noun：標題名詞（「所有服務」／「○○類服務」）；titleByCategory=false 時標題固定「所有○○」（重新開單的會員卡）
// - categoryKey：分類鍵（會員卡用 uuid，其餘 id）
// - caption：表格上方的筆數說明（會員卡沒有）
// - columns：[{ header, numeric, cell(row) }]，「加入」欄固定在最前面
// - getRowKey：列的 key（預設 index，與原檔相同）
// - paging：{ source, count, page, rowsPerPage }；source 是原本分頁文字 effect 的依賴（productList／services），沒有分頁的卡券不傳
function ItemPickerModal({
  open,
  closeModal,
  noun,
  titleByCategory = true,
  categories,
  categoryKey = 'id',
  selectedCategorie,
  selectedCategorieName,
  onClickCategorie,
  onClearCategorie,
  caption,
  columns,
  rows,
  getRowKey = (_row, index) => index,
  onSelect,
  paging,
  onPageChange,
}) {
  const pageRef = useRef(null)
  const contentRef = useRef(null)
  const [categoryNameForDisplay, setCategoryNameForDisplay] = useState('')

  // 呼叫端一律只選一個分類（[分類名稱]；清除時為 '' 或 []），多分類以逗號串接的分支跑不到，2026/10/22 經 Jason 同意刪除
  useEffect(() => {
    if (selectedCategorieName.length === 0) return
    setCategoryNameForDisplay(`${selectedCategorieName[0]}`)
  }, [selectedCategorieName])

  const handleOnChangePage = (_event, nextPage) => {
    onPageChange({
      value: nextPage,
      key: 'pageOffset',
    })
  }

  const handleOnChangeRowsPerPage = event => {
    onPageChange({
      value: event.target.value,
      key: 'pageLimit',
    })
  }

  const pagingSource = paging ? paging.source : null
  useEffect(() => {
    // 卡券選擇窗原本沒有分頁，也沒有這個 effect
    if (!paging) return
    const timer = setInterval(() => {
      if (pageRef.current) {
        pagenationLabel(pageRef.current)
        clearInterval(timer)
      }
    }, 100);

    const clearTimer = setTimeout(() => {
      clearInterval(timer)
    }, 1000);

    return () => {
      clearInterval(timer)
      clearTimeout(clearTimer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [pagingSource, open] 變動時執行；paging 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [pagingSource, open])

  // 以點選為主的選擇窗：開啟時焦點放在彈窗本身，不自動聚焦第一顆分類鈕（STYLE §6 Dialog「開啟時的焦點」）
  const handleOpenAutoFocus = event => {
    event.preventDefault()
    // Radix 在內容掛載後才觸發 onOpenAutoFocus，此時 ref 一定已設定
    contentRef.current.focus()
  }

  // 新外觀（STYLE §6 Dialog）：ui/dialog 標題／內容／底部動作三段；彈窗內沒有 Autocomplete／Select／日期選擇器，可用 Radix Dialog。
  // 原相容層 Modal 沒有 onClose（Esc、點背景都不會關），這裡同樣不傳 onOpenChange、隱藏內建 X，只留原本兩個「關閉」（closeModal）
  return (
    <Dialog open={open}>
      <DialogContent
        ref={contentRef}
        size="lg"
        hideClose
        aria-describedby={undefined}
        onOpenAutoFocus={handleOpenAutoFocus}
      >
        <DialogHeader className="flex-row items-center gap-3 pb-3 pr-4 max-sm:pr-3">
          <DialogTitle className="mr-auto min-w-0">
            {!titleByCategory || selectedCategorieName.length === 0
              ? `所有${noun}`
              : `${categoryNameForDisplay}類${noun}`}
          </DialogTitle>
          <Button variant="ghost" size="icon" aria-label="關閉" title="關閉" onClick={closeModal}>
            <X aria-hidden="true" strokeWidth={1.75} />
          </Button>
        </DialogHeader>
        <DialogBody className="pt-1">
          <div className="mb-3 flex flex-wrap gap-2">
            {categories.map(category => (
              <ToggleGroupItem
                size="sm"
                selected={selectedCategorie.indexOf(category[categoryKey]) !== -1}
                onClick={() => onClickCategorie(category[categoryKey], category.name)}
                key={category[categoryKey]}
              >
                {category.name}
              </ToggleGroupItem>
            ))}
            <Button variant="ghost" size="sm" className="h-7" onClick={onClearCategorie}>
              清除
            </Button>
          </div>
          <p className="mb-2 mt-0 text-caption text-text-secondary">
            {caption}
          </p>
          <Table dense>
            <TableHeader>
              <TableRow>
                <TableHead className="w-px" />
                {columns.map(column => (
                  <TableHead key={column.header} numeric={column.numeric}>{column.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={getRowKey(row, index)}>
                  <TableCell className="w-px">
                    <Button variant="secondary" size="sm" onClick={() => onSelect(row)}>
                      加入
                    </Button>
                  </TableCell>
                  {columns.map(column => (
                    <TableCell key={column.header} numeric={column.numeric}>{column.cell(row)}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogBody>
        <DialogFooter className="flex-wrap gap-y-2">
          {paging && (
            <TablePagination
              ref={pageRef}
              className="mr-auto pt-0"
              labelRowsPerPage='每頁顯示數量'
              count={paging.count}
              onPageChange={handleOnChangePage}
              onRowsPerPageChange={handleOnChangeRowsPerPage}
              page={paging.page}
              rowsPerPage={paging.rowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50, 1000]}
            />
          )}
          <Button variant="secondary" onClick={closeModal}>
            關閉
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ItemPickerModal
