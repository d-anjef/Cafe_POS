import { useEffect, useState } from "react";
import API from "../../api/axios";
import "../../styles/Dashboard.css";

export default function TableManager({ user }) {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const branchId = user?.branchId || user?.branch?._id;

  useEffect(() => {
    fetchTables();
  }, [branchId]);

  const fetchTables = async () => {
    try {
      const { data } = await API.get(`/tables?branchId=${branchId}`);
      setTables(data);
    } catch (err) { console.error(err); }
  };

  // When you click on the floor map, it updates the selected table's location
  const handleMapClick = async (e) => {
    if (!selectedTable) {
      alert("Please select a table from the list first!");
      return;
    }

    // Calculate percentage coordinates based on where you clicked in the box
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    try {
      await API.patch(`/tables/${selectedTable._id}/position`, {
        positionX: x.toFixed(2),
        positionY: y.toFixed(2)
      });
      fetchTables(); // Refresh to show new position
    } catch (err) {
      alert("Error saving position");
    }
  };

  return (
    <div className="table-manager-container">
      <div className="setup-sidebar">
        <h3>1. Select a Table</h3>
        <div className="table-list">
          {tables.map(t => (
            <button 
              key={t._id} 
              className={`setup-item ${selectedTable?._id === t._id ? 'active' : ''}`}
              onClick={() => setSelectedTable(t)}
            >
              {t.tableNumber} {t.positionX ? "📍" : "❓"}
            </button>
          ))}
        </div>
        <p className="hint-text">Tables with 📍 are already placed.</p>
      </div>

      <div className="setup-main">
        <h3>2. Click on the map to place "{selectedTable?.tableNumber || '...'}"</h3>
        <div className="design-floor-plan" onClick={handleMapClick}>
          <div className="map-overlay">ENTRANCE</div>
          <div className="map-overlay kitchen">KITCHEN</div>
          
          {tables.map(t => (
            t.positionX && (
              <div 
                key={t._id}
                className="placed-table"
                style={{ left: `${t.positionX}%`, top: `${t.positionY}%` }}
              >
                {t.tableNumber}
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}