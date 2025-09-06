import { useNavigate } from "react-router-dom";
import { useState } from "react";

type LoginProps = {
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Login({ setIsAuthenticated }: LoginProps) {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const apiKey = import.meta.env.VITE_API_KEY;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${apiEndpoint}users/login`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json", 
          "api-key": `${apiKey}`, 
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Login failed: ${errText}`);
      }

      const data = await response.json();

      if (data.data?.userToken?.access_token) {
        localStorage.setItem("token", data.data.userToken.access_token);
        setIsAuthenticated(true);
        navigate("/");
      } else {
        alert("Invalid response from server");
      }
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mt-5">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
