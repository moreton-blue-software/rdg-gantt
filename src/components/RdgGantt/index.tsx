import React from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import DataGrid, { Row } from 'rdg49';
import { HTML5Backend as Backend } from 'react-dnd-html5-backend';

import * as types from './RdgGanttTypes';

import formatDate from 'date-fns/format';

import get from 'lodash/get';
import useDataGrouper from './useDataGrouper';

import './RdgGantt.css';
import useColumnProcessors from './useColumnProcessors';

export const RdgGanttContext = React.createContext<{
  state?: types.RdgGanttState;
  setState?: React.Dispatch<React.SetStateAction<types.RdgGanttState>>;
}>({});

export default function RdgGantt(props: types.RdgGanttProps) {
  const self = React.useRef<any>({});
  const dataGridRef = React.useRef(null);
  const [state, setState] = React.useState<types.RdgGanttState>({
    taskColumns: [],
    calendarColumns: [],
    rows: [],
    groupKeys: new Set(),
    groupMapping: null,
    maxDate: null,
    minDate: null,
  });

  self.current.formatStageName = props.formatStageName;
  self.current.formatTaskName = props.formatTaskName;

  React.useEffect(() => {
    const data = props.data || [];
    if (data.length < 1) return;

    console.log('>>RdgGantt/index::', 'data', data); //TRACE

    setState(oldState => ({
      ...oldState,
      rows: props.data,
      taskColumns: [
        props.stageKeyName && {
          key: props.stageKeyName,
          name: '',
          width: 10,
          frozen: true,
          groupFormatter(gprops: any) {
            const parentData = get(gprops, `childRows.0.${props.stageKeyName}`);
            console.log('>>RdgGantt/index::', 'gprops', gprops); //TRACE
            if (!parentData) return null;
            return self.current.formatStageName
              ? self.current.formatStageName(gprops) || null
              : gprops.groupKey;
          },
        },
        {
          key: 'title',
          name: 'Title',
          width: 200,
          frozen: true,
          formatter(rprops: any) {
            return <DraggableTitle {...rprops} formatter={self.current.formatTaskName} />;
          },
        },
        {
          key: 'progress',
          name: 'Progress',
          width: 83,
          frozen: true,
        },
        {
          key: 'start',
          name: 'Start',
          width: 100,
          frozen: true,
          formatter(props: any) {
            return props.row.start && formatDate(new Date(props.row.start), 'dd/MM/yyyy');
          },
        },
        {
          key: 'due',
          name: 'Due',
          width: 100,
          frozen: true,
          formatter(props: any) {
            return props.row.due && formatDate(new Date(props.row.due), 'dd/MM/yyyy');
          },
        },
      ].filter(Boolean),
    }));
  }, [props.data, props.stageKeyName]);

  const {
    grouper,
    state: { keys: groupKeys, mapping: groupMapping, minDate, maxDate },
  } = useDataGrouper();

  console.log('>>RdgGantt/index::', 'groupKeys', groupKeys, minDate, maxDate); //TRACE

  state.groupKeys = groupKeys;
  state.groupMapping = groupMapping;
  if (minDate) state.minDate = minDate;
  if (maxDate) state.maxDate = maxDate;

  const allColumns = React.useMemo(
    () => [...state.taskColumns, ...state.calendarColumns],
    [state.taskColumns, state.calendarColumns],
  );

  return (
    <RdgGanttContext.Provider value={{ state, setState }}>
      <Processors />
      <DndProvider backend={Backend}>
        <DataGrid
          ref={dataGridRef}
          columns={allColumns}
          rows={state.rows}
          rowKeyGetter={(row: any) => row.id}
          // onRowsChange={setRows}
          rowHeight={30}
          // selectedRows={selectedRows}
          // onScroll={handleScroll}
          groupBy={props.stageKeyName ? [props.stageKeyName] : undefined}
          rowGrouper={grouper}
          // enableFilterRow
          // onSelectedRowsChange={setSelectedRows}
          expandedGroupIds={groupKeys}
          // onExpandedGroupIdsChange={ids => {
          //   setState(oldState => ({ ...oldState, expandedIds: ids }));
          // }}
          className={`${props.className} rdg-gantt fill-grid rdg-light`}
          rowRenderer={CustomRowRenderer}
          // rowClass={(...row) => {
          //   console.log('>>RdgGantt/index::', 'args', ...row); //TRACE
          //   return '';
          // }}
          // rowClass={
          //   row => undefined
          //   // row.id.includes('7') ? classes.highlightClassname : undefined
          // }
        />
      </DndProvider>
    </RdgGanttContext.Provider>
  );
}

function Processors() {
  useColumnProcessors();
  return null;
}

function CustomRowRenderer(props: any) {
  const [{ isOver }, drop] = useDrop({
    accept: 'GROUP',
    canDrop: () => true,
    drop: () => ({ record: props.row }),
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const rowProps = {
    ...props,
    ref: drop,
    className: isOver ? 'dropping' : undefined,
  };

  // console.log('>>RdgGantt/index::', 'rowProps', rowProps); //TRACE

  return <Row {...rowProps} />;
}

function DraggableTitle(props: any) {
  const [{ isDragging }, drag] = useDrag({
    canDrag: () => true,
    item: { record: props.row, type: 'GROUP' },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      console.log('>>task/TaskGrid::', 'item,dropResult', item, dropResult); //TRACE
      // if (item?.record && dropResult?.record)
      //   onMoveGroup && onMoveGroup({ from: item.record, to: dropResult.record });
    },
  });

  return (
    <span ref={drag}>
      {props.formatter ? props.formatter(props.row) || null : props.row.title}
    </span>
  );
}
