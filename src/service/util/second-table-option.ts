export default (
  firstTableCount: number,
  pageSize: number,
  page: number
): { offset: number; limit: number } => {
  let rowLength = 0;
  if (firstTableCount > pageSize) {
    rowLength = firstTableCount - (page - 1) * pageSize;

    return {
      offset:
        rowLength > 0
          ? 0
          : (firstTableCount % pageSize) +
            (page - 1 - Math.ceil(firstTableCount / pageSize)) * pageSize,
      limit: rowLength > 0 ? pageSize - rowLength : pageSize,
    };
  } else {
    if (page === 1) {
      rowLength = firstTableCount;
    } else {
      rowLength = 0;
    }

    return {
      offset:
        rowLength > 0
          ? 0
          : (firstTableCount % pageSize) + (page - 1) * pageSize,
      limit: rowLength > 0 ? pageSize - rowLength : pageSize,
    };
  }
};
