import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [userInput, setUserInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [restaurants, setRestaurants] = useState({ suggestions: [], visited: [] });

  const [suggestionPage, setSuggestionPage] = useState(0);
  const [visitedPage, setVisitedPage] = useState(0);

  const itemsPerPage = 6;  // For suggestions
  const visitedPerPage = 3; // For visited

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/restaurants');
      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
    }
  };

  const sendMessageToBot = async (message) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      setChatMessages([...chatMessages, { text: message, sender: 'user' }, { text: data.reply, sender: 'bot' }]);
    } catch (error) {
      console.error('Error sending message to bot:', error);
      setChatMessages([...chatMessages, { text: message, sender: 'user' }, { text: "Failed to get a response.", sender: 'bot' }]);
    }
  };

  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    sendMessageToBot(userInput);
    setUserInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const changeSuggestionPage = (direction) => {
    const totalPages = Math.ceil(restaurants.suggestions.length / itemsPerPage);
    setSuggestionPage((prevPage) => {
      if (direction === "next") {
        return (prevPage + 1) % totalPages;
      } else {
        return (prevPage - 1 + totalPages) % totalPages;
      }
    });
  };

  const changeVisitedPage = (direction) => {
    const totalPages = Math.ceil(restaurants.visited.length / visitedPerPage);
    setVisitedPage((prevPage) => {
      if (direction === "next") {
        return (prevPage + 1) % totalPages;
      } else {
        return (prevPage - 1 + totalPages) % totalPages;
      }
    });
  };

  // Calculate the subset of restaurants to display
  const displayedSuggestions = restaurants.suggestions.slice(
    suggestionPage * itemsPerPage,
    (suggestionPage + 1) * itemsPerPage
  );

  const displayedVisited = restaurants.visited.slice(
    visitedPage * visitedPerPage,
    (visitedPage + 1) * visitedPerPage
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1>TABLEO</h1>
      </header>
      <div className="App-content">
        <div className="chatbot-container">
          <div className="chat-messages">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>{msg.text}</div>
            ))}
          </div>
          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Type a message..."
              value={userInput}
              onChange={handleUserInput}
              onKeyPress={handleKeyPress}
            />
            <button className="chat-send-button" onClick={handleSendMessage}>Send</button>
          </div>
        </div>
        <div className="suggestions-section">
          <h2 className="section-title">Suggestions</h2> {/* Added heading */}

          <div className="suggestions-container">
            <button className="suggestion-nav left" onClick={() => changeSuggestionPage("prev")}>{"<"}</button>
            <div className="suggestions">
              {displayedSuggestions.map(suggestion => (
                <div key={suggestion.id} className="restaurant-card">
                  <img src={suggestion.image} alt={suggestion.name} />
                  <div className="restaurant-name">{suggestion.name}</div>
                </div>
              ))}
            </div>
            <button className="suggestion-nav right" onClick={() => changeSuggestionPage("next")}>{">"}</button>
          </div>
          <h2 className="section-title">Visited</h2> {/* Added heading */}
          <div className="visited-container">
            <button className="visited-nav left" onClick={() => changeVisitedPage("prev")}>{"<"}</button>
            <div className="visited">
              {displayedVisited.map(restaurant => (
                <div key={restaurant.id} className="restaurant-card">
                  <img src={restaurant.image} alt={restaurant.name} />
                  <div className="restaurant-name">{restaurant.name}</div>
                </div>
              ))}
            </div>
            <button className="visited-nav right" onClick={() => changeVisitedPage("next")}>{">"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
