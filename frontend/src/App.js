/**
 * @fileoverview Superhero Comparison Application
 * 
 * This React application provides a user interface for browsing, selecting, and comparing
 * superheroes. Users can view a table of superheroes with their stats, select two heroes
 * for comparison, and see a detailed side-by-side comparison with a winner determination
 * based on powerstats.
 * 
 * Features:
 * - Display superhero data in an interactive table
 * - Select up to 2 superheroes for comparison
 * - View detailed comparison with powerstats breakdown
 * - Automatic winner calculation based on stat superiority
 */

import React, { useEffect, useState } from 'react';
import './App.css';

/**
 * Main application component that manages superhero data and comparison views.
 * 
 * This component handles the entire application state including:
 * - Fetching superhero data from the API
 * - Managing user selections for comparison
 * - Switching between table view and comparison view
 * - Rendering appropriate UI based on current state
 * 
 * @component
 * @returns {JSX.Element} The rendered application component
 */
function App() {
  // State: Array of all superhero objects fetched from the API
  const [superheroes, setSuperheroes] = useState([]);
  
  // State: Array of currently selected heroes (max 2) for comparison
  const [selectedHeroes, setSelectedHeroes] = useState([]);
  
  // State: Current view mode - either 'table' (hero list) or 'comparison' (side-by-side comparison)
  const [currentView, setCurrentView] = useState('table');

  // Fetch superhero data from the API on component mount
  useEffect(() => {
    fetch('/api/superheroes')
      .then((response) => response.json())
      .then((data) => setSuperheroes(data))
      .catch((error) => console.error('Error fetching superheroes:', error));
  }, []);

  /**
   * Handles the selection and deselection of heroes for comparison.
   * 
   * Implements a smart selection mechanism:
   * - If hero is already selected, removes it from selection
   * - If less than 2 heroes are selected, adds the hero to selection
   * - If 2 heroes are already selected, replaces the first selection with the new hero
   *   (implements a sliding window of selections)
   * 
   * @param {Object} hero - The hero object to select or deselect
   * @param {string} hero.id - Unique identifier of the hero
   */
  const handleHeroSelection = (hero) => {
    setSelectedHeroes(prev => {
      if (prev.find(h => h.id === hero.id)) {
        // Remove hero if already selected (toggle off)
        return prev.filter(h => h.id !== hero.id);
      } else if (prev.length < 2) {
        // Add hero if less than 2 are currently selected
        return [...prev, hero];
      } else {
        // Replace first selection if 2 heroes are already selected
        // This maintains the most recent two selections
        return [prev[1], hero];
      }
    });
  };

  /**
   * Checks if a hero is currently selected for comparison.
   * 
   * @param {string} heroId - The unique identifier of the hero to check
   * @returns {boolean} True if the hero is selected, false otherwise
   */
  const isHeroSelected = (heroId) => {
    return selectedHeroes.some(h => h.id === heroId);
  };

  /**
   * Switches the view to comparison mode if exactly 2 heroes are selected.
   * This function is triggered when the user clicks the "Compare Heroes" button.
   */
  const handleCompare = () => {
    if (selectedHeroes.length === 2) {
      setCurrentView('comparison');
    }
  };

  /**
   * Returns to the table view and clears all hero selections.
   * This allows users to start a new comparison from scratch.
   */
  const handleBackToTable = () => {
    setCurrentView('table');
    setSelectedHeroes([]);
  };

  /**
   * Calculates the winner between two heroes based on their powerstats.
   * 
   * Compares six key stats: intelligence, strength, speed, durability, power, and combat.
   * For each stat, awards a point to the hero with the higher value (ties award no points).
   * The hero with more points wins; if points are equal, it's a tie.
   * 
   * @param {Object} hero1 - The first hero to compare
   * @param {Object} hero1.powerstats - The powerstats object containing numeric values
   * @param {Object} hero2 - The second hero to compare
   * @param {Object} hero2.powerstats - The powerstats object containing numeric values
   * @returns {Object} Result object containing winner and score
   * @returns {Object|null} returns.winner - The winning hero object, or null if tied
   * @returns {string} returns.score - The score in format "winnerScore-loserScore"
   */
  const calculateWinner = (hero1, hero2) => {
    const stats = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];
    let hero1Score = 0;
    let hero2Score = 0;
    
    // Compare each stat and award points to the superior hero
    stats.forEach(stat => {
      if (hero1.powerstats[stat] > hero2.powerstats[stat]) {
        hero1Score++;
      } else if (hero2.powerstats[stat] > hero1.powerstats[stat]) {
        hero2Score++;
      }
      // No points awarded for equal stats (tie)
    });

    // Determine the winner based on total points
    if (hero1Score > hero2Score) {
      return { winner: hero1, score: `${hero1Score}-${hero2Score}` };
    } else if (hero2Score > hero1Score) {
      return { winner: hero2, score: `${hero2Score}-${hero1Score}` };
    } else {
      // It's a tie - no winner
      return { winner: null, score: `${hero1Score}-${hero2Score}` };
    }
  };

  /**
   * Renders the comparison view showing two heroes side by side.
   * 
   * Displays:
   * - Hero images and names
   * - Stat-by-stat comparison with visual indicators for winners
   * - Final result with overall winner announcement
   * 
   * @returns {JSX.Element|null} The comparison view component, or null if not exactly 2 heroes selected
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

        {/* Detailed stat-by-stat comparison */}
        <div className="stats-comparison">
          {stats.map(stat => {
            const stat1 = hero1.powerstats[stat];
            const stat2 = hero2.powerstats[stat];
            // Determine which hero wins this particular stat (or if it's a tie)
            const winner = stat1 > stat2 ? 'hero1' : stat1 < stat2 ? 'hero2' : 'tie';
            
            return (
              <div key={stat} className="stat-row">
                <div className={`stat-value ${winner === 'hero1' ? 'winner' : ''}`}>
                  {stat1}
                </div>
                <div className="stat-name">
                  {stat.charAt(0).toUpperCase() + stat.slice(1)}
                </div>
                <div className={`stat-value ${winner === 'hero2' ? 'winner' : ''}`}>
                  {stat2}
                </div>
              </div>
            );
          })}
        </div>

        {/* Final winner announcement */}
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
   * Renders the table view displaying all superheroes with their stats.
   * 
   * Features:
   * - Selection status display (X/2 selected)
   * - Interactive checkboxes for hero selection
   * - Compare button (enabled when exactly 2 heroes are selected)
   * - Full table with all hero stats
   * 
   * @returns {JSX.Element} The table view component with superhero list
   */
  const renderTable = () => (
    <div className="table-view">
      <h1>Superheroes</h1>
      
      {/* Selection status and compare button */}
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
      
      {/* Main superhero data table */}
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
        {currentView === 'table' ? renderTable() : renderComparison()}
      </header>
    </div>
  );
}

export default App;
