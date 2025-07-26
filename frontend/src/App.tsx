import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // バックエンドAPIテスト
    fetch("http://localhost:8000/api/test")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Book Management PWA</h1>
      <p>バックエンド接続テスト: {message}</p>
    </div>
  );
}

export default App;
