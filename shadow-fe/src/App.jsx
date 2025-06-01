import { useState } from "react";
import "./App.css";
import axios from "axios";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import LoginPage from "./containers/login/login";

function App() {
  const [response, setResponse] = useState(null);
  const [fetchResponse, setFetchResponse] = useState(null);

  const handlePost = async () => {
    // try {
    //   const res = await axios.post(
    //     "https://jsonplaceholder.typicode.com/posts",
    //     {
    //       title: "Test Post",
    //       body: "Hello from axios",
    //       userId: 1,
    //     }
    //   );
    //   setResponse(res.data);
    //   console.log("Mocked response:", res.data);
    // } catch (error) {
    //   console.error("Request error:", error);
    //   setResponse({ error: error.message });
    // }

    fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Test Post",
        body: "Hello from axios",
        userId: 1,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetch Response:", data);
        setFetchResponse(data);
      })
      .catch((error) => console.error("Fetch Error:", error));
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
