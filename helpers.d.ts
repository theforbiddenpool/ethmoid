interface FetchedData {
    closed_by: string;
    month: number;
    amount: number;
}
declare const getData: (value: string | null) => Promise<Array<FetchedData>>;
interface ChartData {
    name: string;
    labels: Array<string>;
    values: Array<number | null>;
}
declare const parseData: (type: string, data: Array<FetchedData>, wantsLongMonth: boolean) => Array<Array<Object>> | Array<ChartData>;
interface KeyAndArgs {
    funcKey: string;
    args: Array<Object>;
}
declare const getKeyAndArgs: (presentation: any, { type, data, fontFace, chartColors, }: {
    type: string;
    data: Object;
    fontFace: string;
    chartColors: Array<String> | null;
}) => KeyAndArgs;
declare function getBase64Image(img: File): Promise<string | undefined>;
export { getData, parseData, getKeyAndArgs, getBase64Image, };
