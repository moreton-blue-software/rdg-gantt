import React from "react";
import logo from "./logo.svg";
import "./App.css";

import get from "lodash/get";
import RdgGantt from "./components/RdgGantt";

function App() {
  const [state, setState] = React.useState({
    stageMapping: {},
    data: [
      {
        id: "dfdfsdfsdf",
        title: "dfsdf",
        // start: null,
        // due: null,
        progress: 0,
      },
    ],
  });
  return (
    <RdgGantt
      data={state.data}
      stageKeyName="taskSprintId"
      formatStageName={(row) => {
        const v = get(state, ["stageMapping", row.groupKey, "name"]);
        console.log(">>task/TaskGrid::", "v", v, state); //TRACE
        return v;
      }}
    />
  );
}

export default App;
