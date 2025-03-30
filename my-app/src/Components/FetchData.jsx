

import { useState, useEffect } from "react";
import styles from "./Fetchdata.module.css"; // Import the CSS module

function FetchData() {
  const [hits, setHits] = useState([]);
  const [filteredHits, setFilteredHits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOwners, setSelectedOwners] = useState([]);
  const [selectedLawFirms, setSelectedLawFirms] = useState([]);
  const [selectedAttorneys, setSelectedAttorneys] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/api/v3/us", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            input_query: "check",
            input_query_type: "",
            sort_by: "default",
            status: [],
            exact_match: false,
            date_query: false,
            owners: [],
            attorneys: [],
            law_firms: [],
            mark_description_description: [],
            classes: [],
            page: 1,
            rows: 10,
            sort_order: "desc",
            states: [],
            counties: [],
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const fetchedHits = result.body?.hits?.hits || [];
        setHits(fetchedHits);
        setFilteredHits(fetchedHits);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = hits.filter((hit) => {
      const term = searchTerm.toLowerCase();
      const markName = hit._source?.mark_name?.toLowerCase() || "";
      const owner = hit._source?.current_owner?.toLowerCase() || "";
      const lawFirm = hit._source?.law_firm?.toLowerCase() || "";
      const attorney = hit._source?.attorney_name?.toLowerCase() || "";
      const status = hit._source?.status_type?.toLowerCase() || "";

      return (
        markName.includes(term) ||
        owner.includes(term) ||
        lawFirm.includes(term) ||
        attorney.includes(term) ||
        status.includes(term)
      );
    });

    if (statusFilter !== "All") {
      filtered = filtered.filter(
        (hit) => hit._source?.status_type?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (selectedOwners.length > 0) {
      filtered = filtered.filter((hit) => selectedOwners.includes(hit._source?.current_owner));
    }
    if (selectedLawFirms.length > 0) {
      filtered = filtered.filter((hit) => selectedLawFirms.includes(hit._source?.law_firm));
    }
    if (selectedAttorneys.length > 0) {
      filtered = filtered.filter((hit) => selectedAttorneys.includes(hit._source?.attorney_name));
    }

    setFilteredHits(filtered);
  }, [searchTerm, statusFilter, selectedOwners, selectedLawFirms, selectedAttorneys, hits]);

  const handleCheckboxChange = (type, value) => {
    if (type === "owner") {
      setSelectedOwners((prev) =>
        prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
      );
    } else if (type === "lawFirm") {
      setSelectedLawFirms((prev) =>
        prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
      );
    } else if (type === "attorney") {
      setSelectedAttorneys((prev) =>
        prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
      );
    }
  };

  if (loading)
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading trademark data...</p>
      </div>
    );

  if (error)
    return (
      <div className={styles.error}>
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );

  return (
    <div className={styles["trademark-results"]}>
      <h2>Trademarkia</h2>

      <div className={styles["search-container"]}>
        <input
          type="text"
          placeholder="Search by Trademark Name, Owner, Law Firm, Attorney, or Status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles["search-input"]}
        />
      </div>

      <div className={styles["filter-container"]}>
        <div className={styles["status-filter"]}>
          <h3>Filter by Status:</h3>
          <button
            onClick={() => setStatusFilter("All")}
            className={statusFilter === "All" ? styles.active : ""}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("Registered")}
            className={statusFilter === "Registered" ? styles.active : ""}
          >
            Registered
          </button>
          <button
            onClick={() => setStatusFilter("Pending")}
            className={statusFilter === "Pending" ? styles.active : ""}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter("Abandoned")}
            className={statusFilter === "Abandoned" ? styles.active : ""}
          >
            Abandoned
          </button>
        </div>

        <div className={styles["checkbox-filters"]}>
          <div className={styles["filter-group"]}>
            <h3>Filter by Owner</h3>
            {Array.from(new Set(hits.map((hit) => hit._source?.current_owner)))
              .filter(Boolean)
              .map((owner) => (
                <label key={owner}>
                  <input
                    type="checkbox"
                    checked={selectedOwners.includes(owner)}
                    onChange={() => handleCheckboxChange("owner", owner)}
                  />
                  {owner}
                </label>
              ))}
          </div>

          <div className={styles["filter-group"]}>
            <h3>Filter by Law Firm</h3>
            {Array.from(new Set(hits.map((hit) => hit._source?.law_firm)))
              .filter(Boolean)
              .map((lawFirm) => (
                <label key={lawFirm}>
                  <input
                    type="checkbox"
                    checked={selectedLawFirms.includes(lawFirm)}
                    onChange={() => handleCheckboxChange("lawFirm", lawFirm)}
                  />
                  {lawFirm}
                </label>
              ))}
          </div>

          <div className={styles["filter-group"]}>
            <h3>Filter by Attorney</h3>
            {Array.from(new Set(hits.map((hit) => hit._source?.attorney_name)))
              .filter(Boolean)
              .map((attorney) => (
                <label key={attorney}>
                  <input
                    type="checkbox"
                    checked={selectedAttorneys.includes(attorney)}
                    onChange={() => handleCheckboxChange("attorney", attorney)}
                  />
                  {attorney}
                </label>
              ))}
          </div>
        </div>
      </div>

      <div className={styles["table-container"]}>
        <table>
          <thead>
            <tr>
              <th>Mark</th>
              <th>Details</th>
              <th>Status</th>
              <th>Class/Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredHits.length > 0 ? (
              filteredHits.map((hit) => (
                <tr key={hit._id}>
                  <td>
                    <img src="/img-task.png" alt="Trademark" className={styles["trademark-image"]} />
                    <div className={styles["mark-name"]}>{hit._source?.mark_name || "N/A"}</div>
                  </td>
                  <td>
                    <div className={styles["detail-item"]}>
                      <span className={styles["detail-label"]}></span>
                      {hit._source?.law_firm || "N/A"}
                    </div>
                    <div className={styles["detail-item"]}>
                      <span className={styles["detail-label"]}></span>
                      {hit._source?.current_owner || "N/A"}
                    </div>
                    <div className={styles["detail-item"]}>
                      <span className={styles["detail-label"]}></span>
                      {hit._source?.registration_number || "N/A"}
                    </div>
                    <div className={styles["detail-item"]}>
                      <span className={styles["detail-label"]}></span>
                      {hit._source?.registration_date
                        ? new Date(hit._source.registration_date * 1000).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </td>
                  <td>
                    <div className={styles["status-container"]}>
                      <span className={`${styles["status-badge"]} ${styles[hit._source?.status_type?.toLowerCase()]}`}>
                        {hit._source?.status_type || "N/A"}
                      </span>
                      <span className={styles["status-date"]}>
                        {hit._source?.registration_date
                          ? `on ${new Date(hit._source.registration_date * 1000).toLocaleDateString()}`
                          : ""}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.description}>
                      {Array.isArray(hit._source?.mark_description_description)
                        ? hit._source.mark_description_description[0]?.substring(0, 100) + "..."
                        : hit._source?.mark_description_description?.substring(0, 100) + "..." ||
                          "No description"}
                    </div>

                    <div className={styles["class-codes"]}>
                      {hit._source?.class_codes?.map((code) => (
                        <span key={code} className={styles["class-code"]}>
                          Class {code}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className={styles["no-results"]}>
                  No matching results found. Try adjusting your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FetchData;





