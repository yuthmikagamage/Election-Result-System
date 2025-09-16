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
  const selectedDistrictItem = useRef(null);

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

  function detailedResult(result) {
    return (
      <div className="detailsPopUp">
        <div className="container">
          <button className="closeButton" onClick={() => setSeeDetails(false)}>
            X
          </button>

          <h2>
            {result.ed_name} - {result.pd_name}
          </h2>

          <div className="summarySection">
            <div className="summaryStats">
              <div className="stat">
                <span className="label">Total Electors:</span>
                <span className="value">{result.summary.electors}</span>
              </div>
              <div className="stat">
                <span className="label">Polled:</span>
                <span className="value">{result.summary.polled}</span>
              </div>
              <div className="stat">
                <span className="label">Valid:</span>
                <span className="value">{result.summary.valid}</span>
              </div>
              <div className="stat">
                <span className="label">Rejected:</span>
                <span className="value">{result.summary.rejected}</span>
              </div>
            </div>
          </div>

          <div className="candidatesSection">
            <h3>Results by Candidate</h3>
            <div className="candidatesList">
              {result.by_party
                .sort((a, b) => b.votes - a.votes)
                .map((party, key) => (
                  <div key={key} className="candidateItem">
                    <div className="candidateName">{party.candidate}</div>
                    <div className="candidateParty">{party.party_name}</div>
                    <div className="candidateVotes">
                      {party.votes} votes ({party.percentage})
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function districtTotal() {
    const currentResult = currentDistrict.current;
    let totalElectors = 0;
    let totalValidVotes = 0;
    let totalPolled = 0;
    let totalRejected = 0;
    let firstFiveCandidates = [];
    const candidateVoteTotals = {};
    const candidateDistrictVoteTotals = {};

    let DistrictResultAvailable = false;

    let totalDistrictElectors = 0;
    let totalDistrictValidVotes = 0;
    let totalDistrictPolled = 0;
    let totalDistrictRejected = 0;

    for (let i = 0; i < currentResult.length; i++) {
      const level = currentResult[i].level?.toUpperCase().trim();

      if (level === "ELECTORAL-DISTRICT") {
        DistrictResultAvailable = true;
        totalDistrictElectors += currentResult[i].summary.electors;
        totalDistrictValidVotes += currentResult[i].summary.valid;
        totalDistrictPolled += currentResult[i].summary.polled;
        totalDistrictRejected += currentResult[i].summary.rejected;
        currentResult[i].by_party.forEach((party) => {
          const candidateName = party.candidate;
          if (candidateDistrictVoteTotals[candidateName]) {
            candidateDistrictVoteTotals[candidateName] += party.votes;
          } else {
            candidateDistrictVoteTotals[candidateName] = party.votes;
          }
        });
      } else if (level === "POLLING-DIVISION") {
        totalElectors += currentResult[i].summary.electors;
        totalValidVotes += currentResult[i].summary.valid;
        totalPolled += currentResult[i].summary.polled;
        totalRejected += currentResult[i].summary.rejected;

        currentResult[i].by_party.forEach((party) => {
          const candidateName = party.candidate;
          if (candidateVoteTotals[candidateName]) {
            candidateVoteTotals[candidateName] += party.votes;
          } else {
            candidateVoteTotals[candidateName] = party.votes;
          }
        });
      } else if (level === "POSTAL-VOTE") {
        totalElectors += currentResult[i].summary.electors;
        totalValidVotes += currentResult[i].summary.valid;
        totalPolled += currentResult[i].summary.polled;
        totalRejected += currentResult[i].summary.rejected;

        totalDistrictElectors += currentResult[i].summary.electors;
        totalDistrictValidVotes += currentResult[i].summary.valid;
        totalDistrictPolled += currentResult[i].summary.polled;
        totalDistrictRejected += currentResult[i].summary.rejected;

        currentResult[i].by_party.forEach((party) => {
          const candidateName = party.candidate;
          if (candidateVoteTotals[candidateName]) {
            candidateVoteTotals[candidateName] += party.votes;
          } else {
            candidateVoteTotals[candidateName] = party.votes;
          }
        });

        currentResult[i].by_party.forEach((party) => {
          const candidateName = party.candidate;
          if (candidateDistrictVoteTotals[candidateName]) {
            candidateDistrictVoteTotals[candidateName] += party.votes;
          } else {
            candidateDistrictVoteTotals[candidateName] = party.votes;
          }
        });
      } else {
        console.log("Unknown level:", level);
      }

      const sortedCandidates = Object.entries(
        DistrictResultAvailable
          ? candidateDistrictVoteTotals
          : candidateVoteTotals
      )
        .map(([candidateName, votes]) => ({
          candidateName: candidateName,
          votes: votes,
        }))
        .sort((a, b) => b.votes - a.votes);
      firstFiveCandidates = sortedCandidates.slice(0, 5);
    }
    return (
      <div className="districtTotal">
        <div className="summarySection">
          <div className="summaryStats">
            <div className="stat">
              <span className="label">Total Electors:</span>
              <span className="value">
                {DistrictResultAvailable
                  ? totalDistrictElectors
                  : totalElectors}
              </span>
            </div>
            <div className="stat">
              <span className="label">Polled:</span>
              <span className="value">
                {DistrictResultAvailable ? totalDistrictPolled : totalPolled}
              </span>
            </div>
            <div className="stat">
              <span className="label">Valid:</span>
              <span className="value">
                {DistrictResultAvailable
                  ? totalDistrictValidVotes
                  : totalValidVotes}
              </span>
            </div>
            <div className="stat">
              <span className="label">Rejected:</span>
              <span className="value">
                {DistrictResultAvailable
                  ? totalDistrictRejected
                  : totalRejected}
              </span>
            </div>
          </div>
        </div>
        <div className="candidatesSection">
          <h3>Results by Candidate :</h3>
          <div className="candidatesList">
            {firstFiveCandidates.map((candidate, key) => (
              <div key={key} className="candidateItem">
                <div className="candidateParty">{candidate.candidateName}</div>
                <div className="candidateVotes">{candidate.votes}</div>
              </div>
            ))}
          </div>
        </div>
        <h2 className="availableResultText">Result Available Districts!</h2>
      </div>
    );
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
            {!showResultofDistrict && (
              <div className="wrapper">
                <h2>Result available districts!</h2>
                <div className="buttons">
                  {districtSummaryData.map((district, index) => (
                    <button
                      key={index}
                      className="districtButtons"
                      onClick={() => {
                        currentDistrict.current = district;
                        console.log(district);
                        setShowResultofDistrict(true);
                      }}
                    >
                      {district[0].ed_name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {showResultofDistrict && (
              <div className="wrapper">
                <h2>{currentDistrict.current[0].ed_name} District</h2>
                <div className="resultByDistrict">
                  <button
                    className="backButton"
                    onClick={() => setShowResultofDistrict(false)}
                  >
                    ⬅
                  </button>

                  {districtTotal()}

                  {!seeDetails && (
                    <div className="resultByDistrictButtons">
                      {currentDistrict.current.map((item, index) => (
                        <button
                          key={index}
                          className="pdButton"
                          onClick={() => {
                            setSeeDetails(true);
                            selectedDistrictItem.current = item;
                          }}
                        >
                          {item.ed_name} - {item.pd_name}
                        </button>
                      ))}
                    </div>
                  )}
                  {seeDetails && detailedResult(selectedDistrictItem.current)}
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

              {seeDetails && detailedResult(everyResult[currentSelected])}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
