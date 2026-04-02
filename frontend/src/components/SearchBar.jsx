import React, { useState, useRef } from "react";
import fetchWithAuth from "../fetchWithAuth";
import "./css/search.css";
function SearchBar({ onSelectChat }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const timeoutRef = useRef(null);

  const handleSearch = (value) => {
    setSearch(value);
    setError("");

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      if (!value.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetchWithAuth(
          `chats/search?q=${value}`,
          { method: "GET" }
        );
        const data = await res.json();
        console.log("s1",data)
        if (data.success) {
          setResults(data.message);
        } else {
          setError( "Search failed");
        }
      } catch (err) {
        setError("Network error. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

 
  // Start or access a chat with the selected user
  const accessChat = async (userId) => {
    try {
      const res = await fetchWithAuth("chats/access", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      console.log("search",data)
      if (data.success) {
        onSelectChat(data.message); // pass the new chat to parent
        setSearch("");
        setResults([]);
      } else {
        setError(data.message || "Could not start chat");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.log(err.message);
    }
  };

  return (
    <div className="search-box">
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="search-input"
      />
      {loading && <div className="search-loading">Searching...</div>}
      {error && <div className="search-error">{error}</div>}
      {results.length > 0 && (
        <div className="search-results">
          {results.map((user) => (
            <div
              key={user._id}
              className="search-item"
              onClick={() => accessChat(user._id)}
            >
              <img src={user.profilePic} className="search-avatar" alt="" />
              <span>{user.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;