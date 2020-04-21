export default <T>(bill: T[], prop: keyof T): void => {
  let propSet = new Set();

  for (let item of bill) {
    propSet.add(item[prop]);
  }

  console.table(propSet.values());
  console.log(`共有${propSet.size}种`);
};