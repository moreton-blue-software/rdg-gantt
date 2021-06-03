import { eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import React from 'react';
import { RdgGanttContext } from '.';

const PERIOD = 'day';

export default function useColumnProcessors() {
  const { state, setState } = React.useContext(RdgGanttContext);

  const minDate = state?.minDate;
  const maxDate = state?.maxDate;

  React.useEffect(() => {
    const intervals = eachDayOfInterval({
      start: startOfMonth(minDate || new Date()),
      end: endOfMonth(maxDate || new Date()),
    });

    const calendarColumns = intervals.map(date => {
      const fmt = date.toLocaleDateString('en-se');
      return {
        key: fmt,
        name: fmt,
        width: 100,
      };
    });
    setState &&
      setState(oldState => ({
        ...oldState,
        calendarColumns,
      }));
  }, [minDate, maxDate]);
}
