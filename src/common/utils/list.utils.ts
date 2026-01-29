export const isArrayNotNullOrEmpty = (list: any[] | null | undefined): boolean => {
  return Array.isArray(list) && list.length > 0;
};
