import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [superheroes, setSuperheroes] = useState([]);
  const [selectedHeroes, setSelectedHeroes] = useState([]);
  const [currentView, setCurrentView] = useState('table'); // 'table' or 'comparison'
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonError, setComparisonError] = useState(null);

  useEffect(() => {
    fetch('/api/superheroes')
      .then((response) => response.json())
      .then((data) => setSuperheroes(data))
      .catch((error) => console.error('Error fetching superheroes:', error));
  }, []);

  const handleHeroSelection = (hero) => {
    setSelectedHeroes(prev => {
      if (prev.find(h => h.id === hero.id)) {
        // Remove if already selected
        return prev.filter(h => h.id !== hero.id);
      } else if (prev.length < 2) {
        // Add if less than 2 selected
        return [...prev, hero];
      } else {
        // Replace first selection if 2 already selected
        return [prev[1], hero];
      }
    });
  };

  const isHeroSelected = (heroId) => {
    return selectedHeroes.some(h => h.id === heroId);
  };

  const handleCompare = async () => {
    if (selectedHeroes.length !== 2) return;

    const [hero1, hero2] = selectedHeroes;
    setCurrentView('comparison');
    setIsComparing(true);
    setComparisonError(null);
    setComparisonResult(null);

    try {
      const response = await fetch(`/api/superheroes/compare?id1=${hero1.id}&id2=${hero2.id}`);
      if (!response.ok) {
        throw new Error('Failed to compare heroes');
      }
      const data = await response.json();
      setComparisonResult(data);
    } catch (error) {
      console.error('Error comparing superheroes:', error);
      setComparisonError('Unable to compare heroes right now. Please try again.');
    } finally {
      setIsComparing(false);
    }
  };

  const handleBackToTable = () => {
    setCurrentView('table');
    setSelectedHeroes([]);
    setComparisonResult(null);
    setComparisonError(null);
    setIsComparing(false);
  };

  const getScoreFromCategories = (categories, hero1Id, hero2Id) => {
    let hero1Score = 0;
    let hero2Score = 0;

    categories.forEach(category => {
      const winner = category.winner;
      if (winner === hero1Id) hero1Score++;
      if (winner === hero2Id) hero2Score++;
    });

    return `${hero1Score}-${hero2Score}`;
  };

  const formatStatLabel = (stat) => {
    if (!stat) return 'Unknown';
    const text = String(stat);
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const renderComparison = () => {
    if (selectedHeroes.length !== 2) return null;
    
    const [hero1, hero2] = selectedHeroes;
    const categories = comparisonResult?.categories ?? [];
    const overallWinner = comparisonResult?.overall_winner ?? null;
    const winnerName = overallWinner === hero1.id ? hero1.name : overallWinner === hero2.id ? hero2.name : null;
    const score = comparisonResult?.score ?? getScoreFromCategories(categories, hero1.id, hero2.id);

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

        {isComparing && (
          <div className="comparison-loading">Loading comparison...</div>
        )}

        {comparisonError && (
          <div className="comparison-error">{comparisonError}</div>
        )}

        {categories.length > 0 && (
          <>
            <div className="stats-comparison">
              {categories.map(category => {
                const stat = category.stat ?? category.name ?? category.category;
                const stat1 = category.hero1 ?? category.hero1_value ?? category.left;
                const stat2 = category.hero2 ?? category.hero2_value ?? category.right;
                const winner = category.winner;
                const statLabel = formatStatLabel(stat);
                const statKey = stat ?? statLabel;

                return (
                  <div key={statKey} className="stat-row">
                    <div className={`stat-value ${winner === hero1.id ? 'winner' : ''}`}>
                      {stat1}
                    </div>
                    <div className="stat-name">
                      {statLabel}
                    </div>
                    <div className={`stat-value ${winner === hero2.id ? 'winner' : ''}`}>
                      {stat2}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="final-result">
              <h2>Final Result</h2>
              {winnerName ? (
                <div className="winner-announcement">
                  <h3>🏆 {winnerName} Wins!</h3>
                  <p>Score: {score}</p>
                </div>
              ) : (
                <div className="tie-announcement">
                  <h3>🤝 It's a Tie!</h3>
                  <p>Score: {score}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

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
          disabled={selectedHeroes.length !== 2 || isComparing}
        >
          Compare Heroes
        </button>
      </div>
      
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
