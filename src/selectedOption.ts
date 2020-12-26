type SupportedOptions = 'bar' | 'line' | 'table'

const isOfTypeSupportedOptions = (value: string): value is SupportedOptions => ['bar', 'line', 'table'].includes(value);

const selectedOption = (() => {
  let option: SupportedOptions = 'bar';

  return {
    get selected() {
      return option;
    },
    set selected(value: SupportedOptions) {
      if (!isOfTypeSupportedOptions(value)) {
        throw new Error('Option currently not supported.');
      }

      option = value;
    },
  };
})();

export default selectedOption;
export { SupportedOptions };
