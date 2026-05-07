import { useEffect, useState } from "react";
import { api } from "../services/orderService"; // or your axios instance

export default function Tables({ branchId, onSelectTable }) {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");

  // Fetch tables on load
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const { data } = await api.get(`/tables?branchId=${branchId}`);
        setTables(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTables();
  }, [branchId]);

  // Handle table selection
  const handleSelect = (table) => {
    if (table.isOccupied) {
      alert("This table is currently occupied!");
      return;
    }
    setSelectedTable(table._id);
    if (onSelectTable) onSelectTable(table._id);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Tables</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {tables.map((table) => (
          <div
            key={table._id}
            onClick={() => handleSelect(table)}
            style={{
              border: selectedTable === table._id ? "2px solid green" : "1px solid #ccc",
              padding: "1rem",
              width: "120px",
              cursor: table.isOccupied ? "not-allowed" : "pointer",
              backgroundColor: table.isOccupied ? "#f8d7da" : "#f0fff0",
              textAlign: "center",
              borderRadius: "8px",
            }}
          >
            <p><strong>{table.tableNumber}</strong></p>
            <p>Seats: {table.seats}</p>
            <p>{table.isOccupied ? "Occupied" : "Available"}</p>
          </div>
        ))}
      </div>
      {selectedTable && <p style={{ marginTop: "1rem" }}>Selected Table ID: {selectedTable}</p>}
    </div>
  );
}
