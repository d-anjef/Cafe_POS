export default function Alert({ message, type = "error" }) {
  const color = type === "error" ? "red" : "green";
  return <p style={{ color, padding: "0.5rem 0" }}>{message}</p>;
}
