const DEFAULT_API='https://run.mocky.io/v3/159b4afe-eba9-4560-84ac-27a9708e3315'
const DEFAUL_LABEL = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const DEFAULT_VALUES = [null, null, null, null, null, null, null, null, null, null, null, null]

const input = document.querySelector('#getdata-input')
const errorSpan = document.querySelector('#getdata-error')
const optionsButtons = document.querySelectorAll('.options > .btn')

const selectedOption = (function() {
  let option = 'bar'
  let func = 'chart'
  const acceptedValues = ['bar', 'line', 'table']

  const setFunction = function() {
    switch(option) {
      case 'bar': case 'line':
        return 'chart'
      case 'table':
        return 'table'
    }
  }

  return {
    get selected() {
      return option
    },
    get transform() {
      return func
    },
    set selected(value) {
      if(acceptedValues.includes(value)) {
        option = value
        func = setFunction()
      } else {
        throw new Error('Option currently not supported')
      }
    }
  }
})()

const handleOptionsButton = function(e) {
  errorSpan.classList.remove('form__error--show')

  try {
    selectedOption.selected = e.currentTarget.value
    optionsButtons.forEach((btn) => btn.classList.remove('options__btn--active'))
    e.currentTarget.classList.add('options__btn--active')
  } catch {
    errorSpan.textContent = 'Option currently not supported'
    errorSpan.classList.add('form__error--show')
  }
}

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
    errorSpan.textContent = 'I\'m sorry, something went wrong.'
    errorSpan.classList.add('form__error--show')
    return
  }

  const presentation = new PptxGenJS()
  presentation.layout = 'LAYOUT_WIDE'
  const slide = presentation.addSlide()
  slide.addText('Sales', { x: 0.5, y: 0.5, w: '90%', h: 0.5, fontSize: 30, align: 'center', bold: true })

  const chartData = DataTransform[selectedOption.transform](data)
  const { funcKey, args } = getKeyAndArgs(presentation, chartData)

  slide[funcKey](...args)

  presentation.writeFile('Sales.pptx')
}

function getKeyAndArgs(presentation, data) {
  const type = selectedOption.selected
  let funcKey = null
  let args = []

  switch (type) {
    case 'bar':
      funcKey = 'addChart'
      args = [presentation.ChartType.bar, data, { x: 1, y: 1.25, w: '85%', h: 5.5, barGrouping: 'stacked', showLegend: true, legendPos: 'b', showValue: true, dataLabelFontSize: 6 }]
      break;
      
    case 'line':
      funcKey = 'addChart'
      args = [presentation.ChartType.line, data, { x: 1, y: 1.25, w: '85%', h: 5.5, showLegend: true, legendPos: 'b', showValue: true, dataLabelFontSize: 6 }]
      break;

    case 'table':
      funcKey = 'addTable'
      args = [data, { w: '90%', x: 0.66, y: 1.25, border: { type: 'solid', pt: 0.75, color: '#000000' }, autoPage: true, autoPageRepeatHeader: true }]
      break;
  
    default:
      break;
  }

  return { funcKey, args }
}

class DataTransform {
  static chart(data) {
    return data.reduce((acc, cur) => {
      let index = acc.findIndex(d => d.name === cur.closed_by)
      if(index < 0) {
        acc.push({
          name: cur.closed_by,
          labels: DEFAUL_LABEL,
          values: [...DEFAULT_VALUES]
        })
        index = (acc.length === 0) ? 0 : acc.length - 1
      }
      acc[index].values[cur.month] += cur.amount
  
      return acc
    }, [])
  }

  static table(data) {
    const sortedData = [...data]
      .sort((a, b) =>
        (a.closed_by > b.closed_by)
        || (a.closed_by === b.closed_by && a.month > b.month))
      .reduce((acc, cur) => {
        let index = acc.findIndex(d => (d.closed_by  === cur.closed_by) && (d.month === cur.month))
        if(index < 0) {
          acc.push({ ...cur })
        } else {
          acc[index].amount += cur.amount
        }
        return acc
      }, [])

    const headerOptions = { fill: '#757575', fontSize: 15, align: 'center'}
    const header = [
      { text: 'Closed', options: headerOptions},
      { text: 'Month', options: headerOptions},
      { text: 'Amount', options: headerOptions},
    ]
    const rows = [
      header,
      ...sortedData.map(d => [d.closed_by, DEFAUL_LABEL[d.month], d.amount.toLocaleString()])
    ]
    return rows
  }
}

document.querySelector('#generatePptx').addEventListener('click', generatePptx)
optionsButtons.forEach((btn) => btn.addEventListener('click', handleOptionsButton))
