export type RdgGanttProps = {
  className?: string;
  data: RdgGanttTask[];
  stageKeyName?: string;
  formatStageName(row: any): any | undefined;
  formatTaskName(row: any): any | undefined;
};

interface RdgGanttStateGroupMapping {
  [groupKey: string]: RdgGanttTask[];
}

export type RdgGanttState = {
  taskColumns: Array<any>;
  calendarColumns: Array<any>;
  rows: RdgGanttTask[];
  groupKeys: Set<unknown>;
  groupMapping: RdgGanttStateGroupMapping | null;
  minDate: Date | null;
  maxDate: Date | null;
};

export type RdgGanttTask = {
  title: string;
  progress?: number;
  start?: Date;
  due?: Date;
};
