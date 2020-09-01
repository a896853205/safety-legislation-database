import XLSX from 'xlsx';

export default class Excel {
  title: string[] = [];
  sheetName: string = 'Sheet1';
  resData: (string | number | undefined)[][] = [];

  setTitle(title: string[]) {
    this.title = title;
  }
  setSheetName(sheetName: string) {
    this.sheetName = sheetName;
  }

  addData(data: (string | number | undefined)[]) {
    this.resData.push(data);
  }
  renderExcel(url: string) {
    let wb = XLSX.utils.book_new();

    let wsName = this.sheetName;

    /* make worksheet */
    let wsData = [this.title, ...this.resData];
    let ws = XLSX.utils.aoa_to_sheet(wsData);

    /* Add the worksheet to the workbook */
    XLSX.utils.book_append_sheet(wb, ws, wsName);

    XLSX.writeFile(wb, url);
  }
}
