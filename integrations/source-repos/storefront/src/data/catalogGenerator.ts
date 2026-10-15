import { SolutionItem } from '../types';
import { INITIAL_SOLUTIONS as ALL_128_SOLUTIONS_DATA } from './allSolutionsData';

export function generateAllCatalogItems(): SolutionItem[] {
  return ALL_128_SOLUTIONS_DATA;
}

export const ALL_CATALOG_ITEMS: SolutionItem[] = ALL_128_SOLUTIONS_DATA;
export const ALL_210_SOLUTIONS: SolutionItem[] = ALL_128_SOLUTIONS_DATA;
export const ALL_128_SOLUTIONS: SolutionItem[] = ALL_128_SOLUTIONS_DATA;
export const ALL_105_TEMPLATES: SolutionItem[] = ALL_128_SOLUTIONS_DATA.filter(item => item.itemType === 'Autonomous Business Template');

