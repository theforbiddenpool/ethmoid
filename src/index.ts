import PptxGenJS from 'pptxgenjs';
import './styles.css';
import {
  getData, parseData, getKeyAndArgs, getBase64Image,
} from './helpers';

const form = document.querySelector('#gnt-form') as HTMLFormElement;
const errorBox = document.querySelector('#error-box') as HTMLDivElement;

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
    const chartColors = form['pptx-colors'].value && form['pptx-colors'].value.replace('\n', '').split(',');
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

    const selectedOption = form['pptx-option'].value;
    const wantsLongMonth = form['pptx-monthFormat'].checked;
    const chartData = parseData(selectedOption, data, wantsLongMonth);
    const { funcKey, args } = getKeyAndArgs(
      presentation,
      {
        type: selectedOption,
        data: chartData,
        fontFace,
        chartColors,
      },
    );

    // @ts-ignore No index signature with a parameter of type 'string' was found
    slide[funcKey]?.(...args);

    presentation.writeFile(`${title}.pptx`);
  } catch (err) {
    const defaultMessage = 'I\'m sorry, something went wrong.';

    if (!['Error'].includes(err.name)) {
      console.error(err);
      err.message = defaultMessage;
    }

    errorBox.textContent = err.message || defaultMessage;
    errorBox.classList.add('errorBox--show');
  }
};

form.addEventListener('submit', generatePptx);
