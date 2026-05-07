import React, { useState } from 'react';

const TableGrid = ({ tables, selectedTable, onSelectTable }) => {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const categories = [
    { id: 'ALL', label: 'Full View', icon: '🗺️' },
    { id: 'L', label: 'Left Side', icon: '⬅️' },
    { id: 'R', label: 'Right Side', icon: '➡️' },
    { id: 'G', label: 'Garden', icon: '🌿' },
  ];

  // Manual Mapping for Blueprint
  const getTablePosition = (num) => {
    const positions = {
      // Left Side
      "L5": { left: "12%", top: "10%" },
      "L4": { left: "18%", top: "25%" },
      "L3": { left: "28%", top: "10%" },
      "L2": { left: "36%", top: "25%" },
      "L1": { left: "48%", top: "10%", width: "90px" }, 

      // Garden
      "G4": { left: "15%", top: "50%" },
      "G5": { left: "25%", top: "50%" },
      "G3": { left: "25%", top: "65%" },
      "G6": { left: "40%", top: "50%" },
      "G2": { left: "40%", top: "65%" },
      "G1": { left: "55%", top: "55%", width: "60px", height: "60px" },

      // Right Side
      "R1": { left: "85%", top: "40%" },
      "R2": { left: "78%", top: "55%" },
      "R3": { left: "85%", top: "65%" },
      "R4": { left: "78%", top: "75%" },
      "R5": { left: "83%", top: "85%", width: "80px" },
    };
    return positions[num] || { position: 'relative', margin: '5px' };
  };

  const filteredTables = activeFilter === 'ALL' 
    ? tables 
    : tables.filter(t => t.tableNumber?.startsWith(activeFilter));

  return (
    <div className="blueprint-wrapper">
      <div className="mini-nav-container">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`mini-nav-btn ${activeFilter === cat.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(cat.id)}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      <div className="cafe-floor-plan">
        <div className="zone-box entrance-label" style={{ left: '2%', top: '2%', width: '10%' }}>Entrance</div>
        <div className="zone-box parking-zone" style={{ left: '1%', top: '20%', width: '12%', height: '75%', borderStyle: 'dashed' }}>Parking</div>
        <div className="zone-box counter-zone" style={{ right: '2%', top: '2%', width: '20%', height: '25%', background: 'rgba(212, 175, 55, 0.1)' }}>Counter</div>
        <div className="zone-box kitchen-zone" style={{ left: '25%', bottom: '2%', width: '40%', height: '18%', background: '#1a1a1a' }}>KITCHEN</div>
        
        <div className="section-outline" style={{ left: '15%', top: '2%', width: '45%', height: '35%' }}>Left Side Area</div>
        <div className="section-outline" style={{ right: '1%', top: '35%', width: '18%', height: '60%' }}>Right Side Area</div>

        {filteredTables.map((table) => {
          const isOccupied = table.status === 'occupied';
          const isBillRequested = table.status === 'bill_requested'; // NEW STATUS
          const isSelected = selectedTable === table._id;
          const posStyle = getTablePosition(table.tableNumber);

          // Build class string
          let tableClass = "blueprint-table";
          if (isBillRequested) tableClass += " table-pulse-yellow"; // The CSS class we added earlier
          else if (isOccupied) tableClass += " occupied";
          else tableClass += " available";
          
          if (isSelected) tableClass += " selected";

          return (
            <div
              key={table._id}
              className={tableClass}
              style={{
                position: 'absolute',
                ...posStyle
              }}
              onClick={() => onSelectTable(table._id)}
            >
              <div className="table-inner">
                <div className="cap-badge">
                  🪑{table.capacity || 4}
                </div>

                <span className="table-name">{table.tableNumber}</span>
                
                {(isOccupied || isBillRequested) && (
                  <div className="occupant-info">
                    <span className="occ-dot">●</span>
                    {isBillRequested ? "BILLING" : (table.currentSessionUser?.name?.split(' ')[0] || "Guest")}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="floor-legend">
        <span className="legend-item"><span className="dot available"></span> Available</span>
        <span className="legend-item"><span className="dot occupied"></span> Occupied</span>
        <span className="legend-item"><span className="dot table-pulse-yellow"></span> Bill Requested</span>
        <span className="legend-item"><span className="dot selected"></span> Selected</span>
      </div>
    </div>
  );
};

export default TableGrid;