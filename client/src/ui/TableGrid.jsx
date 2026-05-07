export default function TableGrid({ tables, onSelect }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {tables.map(table => (
        <div key={table._id} className={`p-4 border rounded cursor-pointer ${table.isOccupied ? "bg-red-200" : "bg-green-200"}`} onClick={() => onSelect(table)}>
          <p>Table: {table.tableNumber}</p>
          <p>Seats: {table.seats}</p>
        </div>
      ))}
    </div>
  );
}
