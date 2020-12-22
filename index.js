const DEFAULT_API='https://run.mocky.io/v3/919c0cb6-0a21-41bc-80a9-79bbbefdca5e'
const DEFAUL_LABEL = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const DEFAULT_VALUES = [null, null, null, null, null, null, null, null, null, null, null, null]

const input = document.querySelector('#getdata-input')
const errorSpan = document.querySelector('#getdata-error')

const getData = function() {
  const apiLink = input.value || DEFAULT_API

  return fetch(apiLink)
    .then(res => {
      if(res.ok)
      return res.json()
      throw new Error(res.statusText) 
    })
    .then(data => data)
}

const generatePptx = async function(e) {
  e.preventDefault()
  errorSpan.classList.remove('form__error--show')
  const data = await getData()
  // id, amount, month, closed_by

  if(!data) {
    errorSpan.classList.add('form__error--show')
    return
  }

  const presentation = new PptxGenJS()
  const slide = presentation.addSlide()

  const chartData = data.reduce((acc, cur) => {
    let index = acc.findIndex(d => d.name === cur.closed_by)
    if(index < null) {
      acc.push({
        name: cur.closed_by,
        labels: DEFAUL_LABEL,
        values: [...DEFAULT_VALUES]
      })
      index = (acc.length === 0) ? 0 : acc.length - 1
    }
    acc[index].values[cur.month] += cur.amound

    return acc
  }, [])

  slide.addChart(presentation.ChartType.bar, chartData, { x: 1, y: 1, w: 8, h: 4, barGrouping: 'stacked', showLegend: true, legendPos: 'b', showValue: true, showTitle: true, title: 'Sales', dataLabelFontSize: 6 });

  presentation.writeFile('Test.pptx')
}

document.querySelector('#generatePptx').addEventListener('click', generatePptx)