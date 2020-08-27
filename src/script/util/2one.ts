import { variation } from './_math';
export const data2One = (data: any[]) => {
  let k = 1 / Math.log(data.length);

  let minM01 = Infinity;
  let maxM01 = -Infinity;
  let totalM01 = 0;

  let minM02 = Infinity;
  let maxM02 = -Infinity;
  let totalM02 = 0;

  let minR01 = Infinity;
  let maxR01 = -Infinity;
  let totalR01 = 0;

  let minR02 = Infinity;
  let maxR02 = -Infinity;
  let totalR02 = 0;

  let minR03 = Infinity;
  let maxR03 = -Infinity;
  let totalR03 = 0;

  let minD01 = Infinity;
  let maxD01 = -Infinity;
  let totalD01 = 0;

  let minD02 = Infinity;
  let maxD02 = -Infinity;
  let totalD02 = 0;

  let minD03 = Infinity;
  let maxD03 = -Infinity;
  let totalD03 = 0;

  let minD04 = Infinity;
  let maxD04 = -Infinity;
  let totalD04 = 0;

  let minT01 = Infinity;
  let maxT01 = -Infinity;
  let totalT01 = 0;

  let minT02 = Infinity;
  let maxT02 = -Infinity;
  let totalT02 = 0;
  data.forEach(item => {
    minM01 = item.M01 < minM01 ? item.M01 : minM01;
    maxM01 = item.M01 > maxM01 ? item.M01 : maxM01;
    totalM01 += item.M01;

    minM02 = item.M02 < minM02 ? item.M02 : minM02;
    maxM02 = item.M02 > maxM02 ? item.M02 : maxM02;
    totalM02 += item.M02;

    minR01 = item.R01 < minR01 ? item.R01 : minR01;
    maxR01 = item.R01 > maxR01 ? item.R01 : maxR01;
    totalR01 += item.R01;

    minR02 = item.R02 < minR02 ? item.R02 : minR02;
    maxR02 = item.R02 > maxR02 ? item.R02 : maxR02;
    totalR02 += item.R02;

    minR03 = item.R03 < minR03 ? item.R03 : minR03;
    maxR03 = item.R03 > maxR03 ? item.R03 : maxR03;
    totalR03 += item.R03;

    minD01 = item.D01 < minD01 ? item.D01 : minD01;
    maxD01 = item.D01 > maxD01 ? item.D01 : maxD01;
    totalD01 += item.D01;

    minD02 = item.D02 < minD02 ? item.D02 : minD02;
    maxD02 = item.D02 > maxD02 ? item.D02 : maxD02;
    totalD02 += item.D02;

    minD03 = item.D03 < minD03 ? item.D03 : minD03;
    maxD03 = item.D03 > maxD03 ? item.D03 : maxD03;
    totalD03 += item.D03;

    minD04 = item.D04 < minD04 ? item.D04 : minD04;
    maxD04 = item.D04 > maxD04 ? item.D04 : maxD04;
    totalD04 += item.D04;

    minT01 = item.T01 < minT01 ? item.T01 : minT01;
    maxT01 = item.T01 > maxT01 ? item.T01 : maxT01;
    totalT01 += item.T01;

    minT02 = item.T02 < minT02 ? item.T02 : minT02;
    maxT02 = item.T02 > maxT02 ? item.T02 : maxT02;
    totalT02 += item.T02;
  });

  let b = data.map(item => {
    return {
      name: item.name,
      M01: +((item.M01 - minM01) / (maxM01 - minM01)).toFixed(2),
      M02: +((item.M02 - minM02) / (maxM02 - minM02)).toFixed(2),
      R01: +((item.R01 - minR01) / (maxR01 - minR01)).toFixed(2),
      R02: 0,
      R03: +((item.R03 - minR03) / (maxR03 - minR03)).toFixed(2),
      D01: +((item.D01 - minD01) / (maxD01 - minD01)).toFixed(2),
      D02: +((item.D02 - minD02) / (maxD02 - minD02)).toFixed(2),
      D03: +((item.D03 - minD03) / (maxD03 - minD03)).toFixed(2),
      D04: +((item.D04 - minD04) / (maxD04 - minD04)).toFixed(2),
      T01: +((item.T01 - minT01) / (maxT01 - minT01)).toFixed(2),
      T02: +((item.T02 - minT02) / (maxT02 - minT02)).toFixed(2),
    };
  });

  let p = data.map(item => {
    return {
      name: item.name,
      M01: +(item.M01 / totalM01).toFixed(2),
      M02: +(item.M02 / totalM02).toFixed(2),
      R01: +(item.R01 / totalR01).toFixed(2),
      R02: +(item.R02 / totalR02).toFixed(2),
      R03: +(item.R03 / totalR03).toFixed(2),
      D01: +(item.D01 / totalD01).toFixed(2),
      D02: +(item.D02 / totalD02).toFixed(2),
      D03: +(item.D03 / totalD03).toFixed(2),
      D04: +(item.D04 / totalD04).toFixed(2),
      T01: +(item.T01 / totalT01).toFixed(2),
      T02: +(item.T02 / totalT02).toFixed(2),
    };
  });

  let eSum: any[] = new Array(11).fill(0);

  p.forEach(item => {
    eSum[0] += item.M01 ? item.M01 * Math.log(item.M01) : 0;
    eSum[1] += item.M02 ? item.M02 * Math.log(item.M02) : 0;
    eSum[2] += item.R01 ? item.R01 * Math.log(item.R01) : 0;
    eSum[3] += item.R02 ? item.R02 * Math.log(item.R02) : 0;
    eSum[4] += item.R03 ? item.R03 * Math.log(item.R03) : 0;
    eSum[5] += item.D01 ? item.D01 * Math.log(item.D01) : 0;
    eSum[6] += item.D02 ? item.D02 * Math.log(item.D02) : 0;
    eSum[7] += item.D03 ? item.D03 * Math.log(item.D03) : 0;
    eSum[8] += item.D04 ? item.D04 * Math.log(item.D04) : 0;
    eSum[9] += item.T01 ? item.T01 * Math.log(item.T01) : 0;
    eSum[10] += item.T02 ? item.T02 * Math.log(item.T02) : 0;
  });

  let d = eSum.map(item => {
    return 1 - -k * item;
  });

  let M01W = +(d[0] / (d[0] + d[1])).toFixed(2);
  let M02W = +(d[1] / (d[0] + d[1])).toFixed(2);
  let R01W = +(d[2] / (d[2] + d[3] + d[4])).toFixed(2);
  let R02W = +(d[3] / (d[2] + d[3] + d[4])).toFixed(2);
  let R03W = +(d[4] / (d[2] + d[3] + d[4])).toFixed(2);
  let D01W = +(d[5] / (d[5] + d[6] + d[7] + d[8])).toFixed(2);
  let D02W = +(d[6] / (d[5] + d[6] + d[7] + d[8])).toFixed(2);
  let D03W = +(d[7] / (d[5] + d[6] + d[7] + d[8])).toFixed(2);
  let D04W = +(d[8] / (d[5] + d[6] + d[7] + d[8])).toFixed(2);
  let T01W = +(d[9] / (d[9] + d[10])).toFixed(2);
  let T02W = +(d[10] / (d[9] + d[10])).toFixed(2);

  let vari1 = variation([M01W, M02W]);
  let vari2 = variation([R01W, R02W, R03W]);
  let vari3 = variation([D01W, D02W, D03W, D04W]);
  let vari4 = variation([T01W, T02W]);

  let variSum = vari1 + vari2 + vari3 + vari4;
  let variM = vari1 / variSum;
  let variR = vari2 / variSum;
  let variD = vari3 / variSum;
  let variT = vari4 / variSum;

  console.log(variM, variR, variD, variT);

  let M01VW = M01W * variM;
  let M02VW = M02W * variM;
  let R01VW = R01W * variR;
  let R02VW = R02W * variR;
  let R03VW = R03W * variR;
  let D01VW = D01W * variD;
  let D02VW = D02W * variD;
  let D03VW = D03W * variD;
  let D04VW = D04W * variD;
  let T01VW = T01W * variT;
  let T02VW = T02W * variT;

  let M01TotalW = +((M01VW + 0.1258) / 2).toFixed(5);
  let M02TotalW = +((M02VW + 0.2442) / 2).toFixed(5);
  let R01TotalW = +((R01VW + 0.03) / 2).toFixed(5);
  let R02TotalW = +((R02VW + 0.04) / 2).toFixed(5);
  let R03TotalW = +((R03VW + 0.03) / 2).toFixed(5);
  let D01TotalW = +((D01VW + 0.1287) / 2).toFixed(5);
  let D02TotalW = +((D02VW + 0.0693) / 2).toFixed(5);
  let D03TotalW = +((D03VW + 0.0594) / 2).toFixed(5);
  let D04TotalW = +((D04VW + 0.0726) / 2).toFixed(5);
  let T01TotalW = +((T01VW + 0.132) / 2).toFixed(5);
  let T02TotalW = +((T02VW + 0.068) / 2).toFixed(5);

  console.log(
    M01TotalW,
    M02TotalW,
    R01TotalW,
    R02TotalW,
    R03TotalW,
    D01TotalW,
    D02TotalW,
    D03TotalW,
    D04TotalW,
    T01TotalW,
    T02TotalW
  );

  console.log(
    '细节',
    b[0].M01,
    b[0].M02,
    b[0].R01,
    b[0].R02,
    b[0].R03,
    b[0].D01,
    b[0].D02,
    b[0].D03,
    b[0].D04,
    b[0].T01,
    b[0].T02
  );

  let res = b.map(item => {
    return {
      name: item.name,
      score: +(
        item.M01 * M01TotalW +
        item.M02 * M02TotalW +
        item.R01 * R01TotalW +
        item.R02 * R02TotalW +
        item.R03 * R03TotalW +
        item.D01 * D01TotalW +
        item.D02 * D02TotalW +
        item.D03 * D03TotalW +
        item.D04 * D04TotalW +
        item.T01 * T01TotalW +
        item.T02 * T02TotalW
      ).toFixed(2),
    };
  });

  return res;
};
