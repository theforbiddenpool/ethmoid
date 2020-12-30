import PptxGenJS from 'pptxgenjs';
import selectedOption, { SupportedOptions } from './selectedOption';
import { getData, parseData, getKeyAndArgs } from './helpers';

const form = document.querySelector('#generator-form') as HTMLFormElement;
const optionsButtons = document.querySelectorAll('.options > .btn');
const errorBox = document.querySelector('#error-box') as HTMLDivElement;

const handleOptionsButton = (e: Event) => {
  const target = e.currentTarget as HTMLButtonElement;

  errorBox.classList.remove('errorBox--show');

  try {
    selectedOption.selected = target.value as SupportedOptions;
    optionsButtons.forEach((btn) => btn.classList.remove('options__btn--active'));
    target.classList.add('options__btn--active');
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.classList.add('errorBox--show');
  }
};

const generatePptx = async (e: Event) => {
  e.preventDefault();
  errorBox.classList.remove('errorBox--show');
  const input = form.api_link as HTMLInputElement;

  try {
    const data = await getData(input.value);
    // id, amount, month, closed_by

    if (!data || data.length === 0 || !Array.isArray(data)) {
      throw new Error('I\'m sorry, there is something wrong with the data.');
    }

    const presentation = new PptxGenJS();
    presentation.layout = 'LAYOUT_WIDE';
    const slide = presentation.addSlide();
    slide.addText(form['pptx-title'].value || 'Sales', {
      x: 0.5, y: 0.5, w: '90%', h: 0.5, fontSize: 30, align: 'center', bold: true,
    });

    const chartData = parseData(selectedOption.selected, data);
    const { funcKey, args } = getKeyAndArgs(selectedOption.selected, presentation, chartData);

    // @ts-ignore No index signature with a parameter of type 'string' was found
    slide[funcKey]?.(...args);

    presentation.writeFile('Sales.pptx');
  } catch (err) {
    const defaultMessage = 'I\'m sorry, something went wrong.';

    if (!['Error', 'TypeError'].includes(err.name)) {
      console.error(err);
      err.message = defaultMessage;
    }

    errorBox.textContent = err.message || defaultMessage;
    errorBox.classList.add('errorBox--show');
  }
};

document.querySelector('#generatePptx')!.addEventListener('click', generatePptx);
optionsButtons.forEach((btn) => btn.addEventListener('click', handleOptionsButton));
