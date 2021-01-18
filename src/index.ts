import PptxGenJS from 'pptxgenjs';
import selectedOption, { SupportedOptions } from './selectedOption';
import {
  getData, parseData, getKeyAndArgs, getBase64Image,
} from './helpers';

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

    const title = form['pptx-title'].value || 'Sales';
    const fontFace = (form['pptx-font'].value) ? form['pptx-font'].value : 'Arial';
    const fontTitle = (form['pptx-fontTitle'].value) ? form['pptx-fontTitle'] : 'Arial';
    const chartColors = form['pptx-colors'].value && form['pptx-colors'].value.split(',');
    const imageBg = form['pptx-bg'].files[0] && await getBase64Image(form['pptx-bg'].files[0]);

    const presentation = new PptxGenJS();
    presentation.layout = 'LAYOUT_WIDE';
    presentation.author = form['pptx-author'].value || '';
    presentation.company = form['pptx-company'].value || '';
    presentation.revision = form['pptx-revision'].value || 0;
    presentation.subject = form['pptx-subject'].value || '';
    presentation.title = title;

    const slide = presentation.addSlide();
    slide.addText(title, {
      x: 0.5, y: 0.5, w: '90%', h: 0.5, fontSize: 30, align: 'center', bold: true, fontFace: fontTitle,
    });
    slide.background = { data: imageBg };

    const chartData = parseData(selectedOption.selected, data);
    const { funcKey, args } = getKeyAndArgs(presentation,
      {
        type: selectedOption.selected, data: chartData, fontFace, chartColors,
      });

    // @ts-ignore No index signature with a parameter of type 'string' was found
    slide[funcKey]?.(...args);

    presentation.writeFile(`${title}.pptx`);
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

form.addEventListener('submit', generatePptx);
optionsButtons.forEach((btn) => btn.addEventListener('click', handleOptionsButton));
