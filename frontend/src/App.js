/**
 * Superhero Comparison Application
 * 
 * This is a React application that allows users to view, select, and compare superheroes.
 * The app fetches superhero data from a backend API and provides two main views:
 * 1. Table View: Displays all superheroes with their stats in a table format
 * 2. Comparison View: Allows users to compare two selected superheroes side-by-side
 * 
 * The application calculates a winner based on powerstats comparison across six attributes:
 * intelligence, strength, speed, durability, power, and combat.
 */

import React, { useEffect, useState } from 'react';
import './App.css';

/**
 * App Component - Main application component
 * 
 * Manages the application state and renders either the table view or comparison view
 * based on user interactions.
 * 
 * @component
 * @returns {JSX.Element} The rendered application
 */
function App() {
  // State management
  const [superheroes, setSuperheroes] = useState([]); // Array of all superheroes from API
  const [selectedHeroes, setSelectedHeroes] = useState([]); // Array of selected heroes (max 2)
  const [currentView, setCurrentView] = useState('table'); // Current view: 'table' or 'comparison'

  // Fetch superheroes data from API on component mount
  useEffect(() => {
    fetch('/api/superheroes')
      .then((response) => response.json())
      .then((data) => setSuperheroes(data))
      .catch((error) => console.error('Error fetching superheroes:', error));
  }, []);

  /**
   * Handles hero selection/deselection for comparison
   * 
   * Manages the selection logic:
   * - If hero is already selected, remove it
   * - If less than 2 heroes selected, add the new hero
   * - If 2 heroes already selected, replace the first selection
   * 
   * @param {Object} hero - The superhero object to toggle selection
   */
  const handleHeroSelection = (hero) => {
    setSelectedHeroes(prev => {
      if (prev.find(h => h.id === hero.id)) {
        // Remove if already selected
        return prev.filter(h => h.id !== hero.id);
      } else if (prev.length < 2) {
        // Add if less than 2 selected
        return [...prev, hero];
      } else {
        // Replace first selection if 2 already selected (FIFO queue behavior)
        return [prev[1], hero];
      }
    });
  };

  /**
   * Checks if a hero is currently selected
   * 
   * @param {number|string} heroId - The ID of the hero to check
   * @returns {boolean} True if the hero is selected, false otherwise
   */
  const isHeroSelected = (heroId) => {
    return selectedHeroes.some(h => h.id === heroId);
  };

  /**
   * Switches to the comparison view
   * 
   * Only navigates to comparison view if exactly 2 heroes are selected.
   */
  const handleCompare = () => {
    if (selectedHeroes.length === 2) {
      setCurrentView('comparison');
    }
  };

  /**
   * Returns to the table view and clears selected heroes
   */
  const handleBackToTable = () => {
    setCurrentView('table');
    setSelectedHeroes([]);
  };

  /**
   * Calculates the winner between two heroes based on their powerstats
   * 
   * Compares six stats (intelligence, strength, speed, durability, power, combat)
   * and determines a winner based on who wins more categories.
   * 
   * @param {Object} hero1 - First superhero object with powerstats
   * @param {Object} hero2 - Second superhero object with powerstats
   * @returns {Object} Result object containing:
   *   - winner: The winning hero object (or null if tie)
   *   - score: String representation of the score (e.g., "4-2")
   */
  const calculateWinner = (hero1, hero2) => {
    const stats = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];
    let hero1Score = 0;
    let hero2Score = 0;
    
    // Compare each stat and increment winner's score
    stats.forEach(stat => {
      if (hero1.powerstats[stat] > hero2.powerstats[stat]) {
        hero1Score++;
      } else if (hero2.powerstats[stat] > hero1.powerstats[stat]) {
        hero2Score++;
      }
      // Equal stats don't count for either hero
    });

    // Determine overall winner based on total score
    if (hero1Score > hero2Score) {
      return { winner: hero1, score: `${hero1Score}-${hero2Score}` };
    } else if (hero2Score > hero1Score) {
      return { winner: hero2, score: `${hero2Score}-${hero1Score}` };
    } else {
      // Tie - no winner
      return { winner: null, score: `${hero1Score}-${hero2Score}` };
    }
  };

  /**
   * Renders the comparison view showing two heroes side-by-side
   * 
   * Displays:
   * - Hero cards with images
   * - Stat-by-stat comparison with visual winner indication
   * - Final result showing overall winner
   * 
   * @returns {JSX.Element|null} The comparison view JSX or null if less than 2 heroes selected
   */
  const renderComparison = () => {
    if (selectedHeroes.length !== 2) return null;
    
    const [hero1, hero2] = selectedHeroes;
    const result = calculateWinner(hero1, hero2);
    const stats = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];

    return (
      <div className="comparison-view">
        <button className="back-button" onClick={handleBackToTable}>
          ← Back to Heroes Table
        </button>
        <h1>Superhero Comparison</h1>
        
        {/* Hero cards displaying images and names */}
        <div className="comparison-container">
          <div className="hero-card">
            <img src={hero1.image} alt={hero1.name} className="hero-image" />
            <h2>{hero1.name}</h2>
          </div>
          
          <div className="vs-section">
            <h2>VS</h2>
          </div>
          
          <div className="hero-card">
            <img src={hero2.image} alt={hero2.name} className="hero-image" />
            <h2>{hero2.name}</h2>
          </div>
        </div>

        {/* Stat-by-stat comparison with winner highlighting */}
        <div className="stats-comparison">
          {stats.map(stat => {
            const stat1 = hero1.powerstats[stat];
            const stat2 = hero2.powerstats[stat];
            // Determine which hero wins this stat (or if it's a tie)
            const winner = stat1 > stat2 ? 'hero1' : stat1 < stat2 ? 'hero2' : 'tie';
            
            return (
              <div key={stat} className="stat-row">
                <div className={`stat-value ${winner === 'hero1' ? 'winner' : ''}`}>
                  {stat1}
                </div>
                <div className="stat-name">
                  {/* Capitalize first letter of stat name */}
                  {stat.charAt(0).toUpperCase() + stat.slice(1)}
                </div>
                <div className={`stat-value ${winner === 'hero2' ? 'winner' : ''}`}>
                  {stat2}
                </div>
              </div>
            );
          })}
        </div>

        {/* Final result announcement */}
        <div className="final-result">
          <h2>Final Result</h2>
          {result.winner ? (
            <div className="winner-announcement">
              <h3>🏆 {result.winner.name} Wins!</h3>
              <p>Score: {result.score}</p>
            </div>
          ) : (
            <div className="tie-announcement">
              <h3>🤝 It's a Tie!</h3>
              <p>Score: {result.score}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Renders the table view showing all superheroes
   * 
   * Displays:
   * - Selection info and compare button
   * - Table with all heroes and their stats
   * - Checkboxes for hero selection
   * 
   * @returns {JSX.Element} The table view JSX
   */
  const renderTable = () => (
    <div className="table-view">
      <h1>Superheroes</h1>
      <div className="selection-info">
        <p>Select 2 superheroes to compare ({selectedHeroes.length}/2 selected)</p>
        {selectedHeroes.length > 0 && (
          <div className="selected-heroes">
            Selected: {selectedHeroes.map(h => h.name).join(', ')}
          </div>
        )}
        <button 
          className="compare-button" 
          onClick={handleCompare}
          disabled={selectedHeroes.length !== 2}
        >
          Compare Heroes
        </button>
      </div>
      
      {/* Table displaying all superheroes with their stats */}
      <table>
        <thead>
          <tr>
            <th>Select</th>
            <th>ID</th>
            <th>Name</th>
            <th>Image</th>
            <th>Intelligence</th>
            <th>Strength</th>
            <th>Speed</th>
            <th>Durability</th>
            <th>Power</th>
            <th>Combat</th>
          </tr>
        </thead>
        <tbody>
          {superheroes.map((hero) => (
            <tr 
              key={hero.id} 
              className={isHeroSelected(hero.id) ? 'selected-row' : ''}
            >
              <td>
                <input
                  type="checkbox"
                  checked={isHeroSelected(hero.id)}
                  onChange={() => handleHeroSelection(hero)}
                />
              </td>
              <td>{hero.id}</td>
              <td>{hero.name}</td>
              <td><img src={hero.image} alt={hero.name} width="50" /></td>
              <td>{hero.powerstats.intelligence}</td>
              <td>{hero.powerstats.strength}</td>
              <td>{hero.powerstats.speed}</td>
              <td>{hero.powerstats.durability}</td>
              <td>{hero.powerstats.power}</td>
              <td>{hero.powerstats.combat}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="App">
      <header className="App-header">
        {/* Render appropriate view based on current state */}
        {currentView === 'table' ? renderTable() : renderComparison()}
      </header>
    </div>
  );
}

export default App;
