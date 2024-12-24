export const loadXLSX = async () => {
  const xlsx = await import('xlsx');
  return xlsx;
};

export const exportToExcel = async (data: any[], filename: string) => {
  const xlsx = await loadXLSX();
  const ws = xlsx.utils.json_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
  xlsx.writeFile(wb, `${filename}.xlsx`);
};
