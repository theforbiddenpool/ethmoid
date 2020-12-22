const DEFAULT_API='https://run.mocky.io/v3/159b4afe-eba9-4560-84ac-27a9708e3315'
const DEFAUL_LABEL = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const DEFAULT_VALUES = [null, null, null, null, null, null, null, null, null, null, null, null]

const input = document.querySelector('#getdata-input')
const errorSpan = document.querySelector('#getdata-error')
const optionsButtons = document.querySelectorAll('.options > .btn')

const selectedOption = (function() {
  let option = 'bar'
  const acceptedValues = ['bar', 'line']

  return {
    get selected() {
      return option
    },
    set selected(value) {
      if(acceptedValues.includes(value)) {
        option = value
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
  const slide = presentation.addSlide()

  const chartData = DataTransform.chart(data)

  const {funcKey, args} = getKeyAndArgs(presentation, chartData)
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
      args = [presentation.ChartType.bar, data, { x: 1, y: 1, w: 8, h: 4, barGrouping: 'stacked', showLegend: true, legendPos: 'b', showValue: true, showTitle: true, title: 'Sales', dataLabelFontSize: 6 }]
      break;

    case 'line':
      funcKey = 'addChart'
      args = [presentation.ChartType.line, data, { x: 1, y: 1, w: 8, h: 4, showLegend: true, legendPos: 'b', showTitle: true, showValue: true, title: 'Sales', dataLabelFontSize: 6 }]
      break;
  
    default:
      break;
  }

  return {funcKey, args}
}

class DataTransform {
  static chart(data) {
    return data.reduce((acc, cur) => {
      let index = acc.findIndex(d => d.name === cur.closed_by)
      if(index < null) {
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
}

document.querySelector('#generatePptx').addEventListener('click', generatePptx)
optionsButtons.forEach((btn) => btn.addEventListener('click', handleOptionsButton))
