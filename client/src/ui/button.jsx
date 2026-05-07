export default function Button({ children, onClick, type="button", className="" }) {
  return (
    <button type={type} className={`px-4 py-2 bg-blue-600 text-white rounded ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}
