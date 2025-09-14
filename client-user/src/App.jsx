import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const socket = useRef(null);
  const [everyResult, setEveryResult] = useState([]);
  const [seeDetails, setSeeDetails] = useState(false);
  const [currentSelected, setCurrentSelected] = useState(null);
  const [resultsAvailable, setResultsAvailable] = useState(false);

  useEffect(() => {
    if (socket.current) {
      return;
    }
    socket.current = new WebSocket("ws://localhost:3002");
    socket.current.onopen = () => {
      socket.current.send(JSON.stringify({ type: "EndUser-Connection" }));
    };
    socket.current.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      if (data.type === "all-results") {
        console.log(data.results.length + " previous results loaded ");
        setEveryResult(data.results);
        if (data.results.length > 0) {
          setResultsAvailable(true);
        }
      } else if (data.type === "new-result") {
        console.log("New election result received -", data.result.reference);
        setEveryResult((prev) => [data.result, ...prev]);
        setResultsAvailable(true);
      }
    });
  }, []);

  function selectItem(item) {
    setSeeDetails(true);
    setCurrentSelected(item);
  }

  return (
    <div className="client">
      {!resultsAvailable && (
        <div className="noResults">No Results Available !</div>
      )}

      {resultsAvailable && (
        <div>
          {!seeDetails && (
            <div>
              <h1>Presidential Election Results</h1>
              <div className="items">
                {everyResult.map((result, key) => (
                  <button
                    key={key}
                    className="resultButton"
                    onClick={() => selectItem(key)}
                  >
                    {result.ed_name} - {result.pd_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {seeDetails && (
            <div className="detailsPopUp">
              <div className="container">
                <button
                  className="closeButton"
                  onClick={() => setSeeDetails(false)}
                >
                  X
                </button>

                <h2>
                  {everyResult[currentSelected].ed_name} -{" "}
                  {everyResult[currentSelected].pd_name}
                </h2>

                <div className="summarySection">
                  <div className="summaryStats">
                    <div className="stat">
                      <span className="label">Total Electors:</span>
                      <span className="value">
                        {everyResult[currentSelected].summary.electors}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="label">Polled:</span>
                      <span className="value">
                        {everyResult[currentSelected].summary.polled}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="label">Valid:</span>
                      <span className="value">
                        {everyResult[currentSelected].summary.valid}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="label">Rejected:</span>
                      <span className="value">
                        {everyResult[currentSelected].summary.rejected}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="candidatesSection">
                  <h3>Results by Candidate</h3>
                  <div className="candidatesList">
                    {[...everyResult[currentSelected].by_party]
                      .sort((a, b) => b.votes - a.votes)
                      .map((party, key) => (
                        <div key={key} className="candidateItem">
                          <div className="candidateName">{party.candidate}</div>
                          <div className="candidateParty">
                            {party.party_name}
                          </div>
                          <div className="candidateVotes">
                            {party.votes} votes ({party.percentage}%)
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
