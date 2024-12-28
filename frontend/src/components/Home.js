import React from "react";
import "../styles/home.css";

function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Budget Buddy</h1>
        <p>Your personal financial assistant</p>
      </header>
      <section className="home-section">
        <h2>Financial Tips</h2>
          <li>Create a budget and stick to it</li>
          <li>Track your expenses</li>
          <li>Save a portion of your income</li>
      </section>
      <section className="home-section">
        <h2>Tools and Resources</h2>
        <p>Explore our tools to help you manage your finances better.</p>
        <button className="home-button">Budget Planner</button>
        <button className="home-button">Expense Tracker</button>
        <button className="home-button">Financial Reports</button>
      </section>
    </div>
  );
}

export default Home;