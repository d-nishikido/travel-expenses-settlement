export const EXPENSE_CATEGORIES = [
  { value: 'transportation', label: '交通費' },
  { value: 'accommodation', label: '宿泊費' },
  { value: 'meal', label: '食費' },
  { value: 'other', label: 'その他' },
] as const;

export const EXPENSE_STATUSES = [
  { value: 'draft', label: '下書き', color: 'gray' },
  { value: 'submitted', label: '申請中', color: 'blue' },
  { value: 'approved', label: '承認済', color: 'green' },
  { value: 'rejected', label: '却下', color: 'red' },
  { value: 'paid', label: '支払済', color: 'purple' },
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]['value'];
export type ExpenseStatus = typeof EXPENSE_STATUSES[number]['value'];