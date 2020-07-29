const square = (x: number) => {
  return x * x;
};
const mean = (data: number[]) => {
  let sum = 0;

  data.forEach(item => {
    sum += item;
  });

  return data.length ? sum / data.length : 0;
};
const deviations = (data: number[]) => {
  let _mean = mean(data);
  return data.map(item => {
    return item - _mean;
  });
};
export const stddev = (data: number[]) => {
  return data.length
    ? mean(
        deviations(data).map(item => {
          return square(item);
        })
      )
    : 0;
};

export const variation = (data: number[]) => {
  return data.length ? stddev(data) / mean(data) : 0;
};
