export type DailyConversionRow = {
  date: string;
  pageViews: number;
  whatsappClicks: number;
  quoteSubmits: number;
};

export type ExecutiveSummary = {
  dailySeries: DailyConversionRow[];
  leadsByCity: { label: string; count: number }[];
  topQuotedEquipment: { label: string; count: number }[];
  topCategories: { label: string; count: number }[];
};
