import { useState } from "react";

export default function Profile({ user }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const handleSave = () => {
    alert(`Profile updated: ${name} (${email})`);
    // Connect API later
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Profile</h2>
      <div>
        <label>Name:</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label>Email:</label>
        <input value={email} disabled />
      </div>
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
