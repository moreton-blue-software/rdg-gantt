import React from 'react';
import debounce from 'lodash/debounce';

export default function useDataGrouper() {
  const [state, setState] = React.useState({
    keys: new Set(),
    mapping: null,
    tmp: null,
    minDate: null,
    maxDate: null,
  });

  const updateExpandedIds = React.useCallback(
    debounce((ids, { minDate, maxDate, mapping }) => {
      setState(oldState => {
        //skip if changed
        if (
          JSON.stringify([oldState.tmp, minDate, maxDate]) ===
          JSON.stringify([ids, minDate, maxDate])
        )
          return oldState;
        return {
          ...oldState,
          keys: new Set(ids),
          tmp: ids,
          maxDate: maxDate && new Date(maxDate),
          minDate: minDate && new Date(minDate),
          mapping,
        };
      });
    }, 500),
    [],
  );

  const grouper = React.useCallback(
    (data, keyName) => {
      const keys = [];
      const mapping: any = {};
      let minDate, maxDate;
      for (const item of data) {
        const groupKey = item[keyName];
        keys.push(groupKey);
        mapping[groupKey] = mapping[groupKey] || [];
        mapping[groupKey].push(item);
        if (!minDate || item.start < minDate) minDate = item.start;
        if (!maxDate || item.due > maxDate) maxDate = item.due;
      }
      updateExpandedIds(keys, { minDate, maxDate, mapping });
      // console.log('>>RdgGantt/useDataGrouper::', 'groupedData', mapping); //TRACE
      // self.current.groupedData = groupedData;
      return mapping;
    },
    [updateExpandedIds],
  );

  // console.log('>>RdgGantt/useDataGrouper::', 'groupKeys', state.keys); //TRACE

  return { grouper, state };
}
