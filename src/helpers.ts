/* eslint-disable import/prefer-default-export */
import { DEFAULT_API, DEFAULT_VALUES, DEFAUL_LABEL } from './constants';

interface FetchedData {
  // eslint-disable-next-line camelcase
  closed_by: string,
  month: number,
  amount: number
}

const getData = (value: string | null): Promise<Array<FetchedData>> => {
  const apiLink: string = value || DEFAULT_API;

  return fetch(apiLink)
    .then((res) => {
      if (res.ok) { return res.json(); }
      throw new Error(res.statusText);
    })
    .then((data) => data)
    .catch((err) => { throw err; });
};

interface ChartData {
  name: string,
  labels: Array<string>,
  values: Array<number | null>
}

// eslint-disable-next-line max-len
const parseData = (type: string, data: Array<FetchedData>): Array<Array<Object>> | Array<ChartData> => {
  function chart() {
    return data.reduce((acc: Array<ChartData>, cur: FetchedData) => {
      let index = acc.findIndex((d) => d.name === cur.closed_by);
      if (index < 0) {
        acc.push({
          name: cur.closed_by,
          labels: DEFAUL_LABEL,
          values: [...DEFAULT_VALUES],
        });
        index = (acc.length === 0) ? 0 : acc.length - 1;
      }
      // @ts-ignore: Object is possibly 'null'
      acc[index].values[cur.month] += cur.amount;

      return acc;
    }, []);
  }

  function table() {
    const sortedData: Array<FetchedData> = [...data]
      // @ts-ignore
      .sort((a, b) => (a.closed_by > b.closed_by)
        || (a.closed_by === b.closed_by && a.month > b.month))
      .reduce((acc: Array<FetchedData>, cur: FetchedData) => {
        const index = acc.findIndex((d) => (d.closed_by === cur.closed_by)
          && (d.month === cur.month));
        if (index < 0) {
          acc.push({ ...cur });
        } else {
          acc[index].amount += cur.amount;
        }
        return acc;
      }, []);

    const headerOptions = { fill: '#757575', fontSize: 15, align: 'center' };
    const header = [
      { text: 'Closed', options: headerOptions },
      { text: 'Month', options: headerOptions },
      { text: 'Amount', options: headerOptions },
    ];
    const rows = [
      header,
      ...sortedData.map((d) => [d.closed_by, DEFAUL_LABEL[d.month], d.amount.toLocaleString()]),
    ];
    return rows;
  }

  switch (type) {
    case 'bar': case 'line':
      return chart();
    case 'table':
      return table();
    default:
      throw new Error('Option currently not supported.');
  }
};

interface KeyAndArgs {
  funcKey: string | null,
  args: Array<Object>
}

const getKeyAndArgs = (type: string, presentation: any, data: Object): KeyAndArgs => {
  let funcKey: string | null = null;
  let args: Array<Object> = [];

  switch (type) {
    case 'bar':
      funcKey = 'addChart';
      args = [presentation.ChartType.bar, data, {
        x: 1, y: 1.25, w: '85%', h: 5.5, barGrouping: 'stacked', showLegend: true, legendPos: 'b', showValue: true, dataLabelFontSize: 6,
      }];
      break;

    case 'line':
      funcKey = 'addChart';
      args = [presentation.ChartType.line, data, {
        x: 1, y: 1.25, w: '85%', h: 5.5, showLegend: true, legendPos: 'b', showValue: true, dataLabelFontSize: 6,
      }];
      break;

    case 'table':
      funcKey = 'addTable';
      args = [data, {
        w: '90%', x: 0.66, y: 1.25, border: { type: 'solid', pt: 0.75, color: '#000000' }, autoPage: true, autoPageRepeatHeader: true,
      }];
      break;

    default:
      break;
  }

  return { funcKey, args };
};

export { getData, parseData, getKeyAndArgs };
