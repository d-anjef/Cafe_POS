export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded shadow-lg">
        {children}
        <button className="mt-2 px-3 py-1 bg-red-500 text-white rounded" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
