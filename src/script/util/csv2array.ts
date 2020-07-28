export const csv2Array = (csvBuffer: Buffer) => {
  const data = csvBuffer.toString();
  const rows = data.split('\r\n');
  const res: { name: string; value: number }[] = [];
  
  rows.pop();

  rows.forEach(row => {
    res.push({
      name: row.split(',')[0],
      value: +row.split(',')[1],
    });
  });

  return res;
};
