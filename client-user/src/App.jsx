import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const socket = useRef(null);
  const [everyResult, setEveryResult] = useState([]);
  const [seeDetails, setSeeDetails] = useState(false);
  const [currentSelected, setCurrentSelected] = useState(null);
  const [viewSummery, setViewSummery] = useState(false);
  const [districtSummaryData, setDistrictSummaryData] = useState([]);
  const [showResultofDistrict, setShowResultofDistrict] = useState(false);
  const currentDistrict = useRef(null);

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
      } else if (data.type === "new-result") {
        console.log("New election result received -", data.result.reference);
        setEveryResult((prev) => [data.result, ...prev]);
      }
    });
  }, []);

  function selectItem(item) {
    setSeeDetails(true);
    setCurrentSelected(item);
  }

  function showSummery() {
    let districtViseResults = Array.from({ length: 22 }, () => []);
    for (let i = 0; i < everyResult.length; i++) {
      districtViseResults[everyResult[i].ed_code - 1].push(everyResult[i]);
    }

    const filteredSummary = districtViseResults.filter(
      (districtArray) => districtArray.length > 0
    );

    setDistrictSummaryData(filteredSummary);
    setViewSummery(true);
  }

  return (
    <div className="client">
      {viewSummery && (
        <div className="districtSummery">
          <div className="container">
            {" "}
            <button
              className="closeButton"
              onClick={() => setViewSummery(false)}
            >
              X
            </button>
            <h2>Result released districts</h2>
            {!showResultofDistrict && (
              <div className="buttons">
                {districtSummaryData.map((district, index) => (
                  <button
                    key={index}
                    className="districtButtons"
                    onClick={() => {
                      currentDistrict.current = district;
                      setShowResultofDistrict(true);
                    }}
                  >
                    {district[0].ed_name}
                  </button>
                ))}
              </div>
            )}
            {showResultofDistrict && (
              <div className="resultByDistrict">
                <button
                  className="backButton"
                  onClick={() => setShowResultofDistrict(false)}
                >
                  ⬅
                </button>
                <div className="resultByDistrictButtons">
                  {currentDistrict.current.map((item, index) => (
                    <button key={index} className="pdButton">
                      {item.ed_name} - {item.pd_name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {!viewSummery && (
        <div className="startPage">
          {everyResult.length == 0 && (
            <div className="noResults">No Results Available !</div>
          )}

          {everyResult.length > 0 && (
            <div>
              {!seeDetails && (
                <div>
                  <h1>Presidential Election Results</h1>
                  <div className="upperSummery">
                    <div className="latest" onClick={() => selectItem(0)}>
                      <h4>Latest Result</h4>
                      <h4>
                        {everyResult[0].ed_name +
                          " - " +
                          everyResult[0].pd_name}
                      </h4>
                    </div>
                    <div className="total" onClick={showSummery}>
                      District Summery
                    </div>
                  </div>
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
                              <div className="candidateName">
                                {party.candidate}
                              </div>
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
      )}
    </div>
  );
}

export default App;
