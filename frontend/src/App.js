import React, { useEffect, useState } from 'react';
import axios from "axios";

function App() {
  const [data, setData] = useState([]);
  const [name, setName] = useState(""); // State for user input

  const backendURL = "http://192.168.49.2:31234";
  const socketURL = `${backendURL.replace("http", "ws")}/ws`;

  console.log("Using Backend URL:", backendURL);

  // Fetch data from backend
  useEffect(() => {
    axios.get(`${backendURL}/api/data`)
      .then(response => {
        console.log("Backend Response:", response.data);
        setData(response.data);
      })
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  // WebSocket connection
  useEffect(() => {
    const socket = new WebSocket(socketURL);

    socket.onopen = () => {
      console.log("Connected to WebSocket");
      socket.send("Hello Server");
    };

    socket.onmessage = (event) => {
      console.log("Message from server:", event.data);
    };

    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket Disconnected");
    };

    return () => {
      socket.close();
    };
  }, []);

  // Function to insert data
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;

    try {
      const response = await fetch(`${backendURL}/api/data`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const newData = await response.json();
      setData([...data, newData]); // Update UI
      setName(""); // Clear input
    } catch (err) {
      console.error("Error inserting data:", err);
    }
  };

  return (
    <div>
      <h1>PERN Stack in Minikube</h1>

      {/* Form to Insert Data */}
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Enter name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
        <button type="submit">Add</button>
      </form>

      {/* Display Database Table */}
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;

