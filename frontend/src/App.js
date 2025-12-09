import React, { useEffect, useState } from 'react';
import './App.css';
import Login from './Login';
import './Login.css';

function App() {
  const [superheroes, setSuperheroes] = useState([]);
  const [selectedHeroes, setSelectedHeroes] = useState([]);
  const [currentView, setCurrentView] = useState('table'); // 'table' or 'comparison'
  const [comparisonResult, setComparisonResult] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

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

  const handleCompare = () => {
    if (selectedHeroes.length === 2) {
      const id1 = selectedHeroes[0].id;
      const id2 = selectedHeroes[1].id;
      const hero1 = selectedHeroes[0];
      const hero2 = selectedHeroes[1];

      // Compute and show local comparison immediately so tests and UI are responsive
      const local = computeLocalComparison(hero1, hero2);
      setComparisonResult(local);
      setCurrentView('comparison');

      // Fetch authoritative comparison from backend and update when ready
      fetch(`/api/superheroes/compare?id1=${id1}&id2=${id2}`)
        .then((res) => {
          if (!res.ok) throw new Error('Compare API error');
          return res.json();
        })
        .then((data) => {
          setComparisonResult(data);
        })
        .catch((err) => {
          console.error('Error comparing heroes:', err);
        });
    }
  };

  const handleBackToTable = () => {
    setCurrentView('table');
    setSelectedHeroes([]);
  };

  // calculateWinner is no longer used; backend returns comparisonResult
  // Local synchronous comparison to render immediately while backend fetches
  const computeLocalComparison = (hero1, hero2) => {
    const STAT_ORDER = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];
    const categories = [];
    let hero1Wins = 0;
    let hero2Wins = 0;

    STAT_ORDER.forEach((stat) => {
      const v1 = Number(hero1.powerstats[stat]) || 0;
      const v2 = Number(hero2.powerstats[stat]) || 0;
      let winner = 'tie';
      if (v1 > v2) {
        winner = 1;
        hero1Wins++;
      } else if (v2 > v1) {
        winner = 2;
        hero2Wins++;
      }
      categories.push({ name: stat, winner, id1_value: v1, id2_value: v2 });
    });

    let overall_winner = 'tie';
    if (hero1Wins > hero2Wins) overall_winner = 1;
    else if (hero2Wins > hero1Wins) overall_winner = 2;

    return { id1: hero1.id, id2: hero2.id, categories, overall_winner };
  };

  const buildScoreString = (categories) => {
    if (!categories || !Array.isArray(categories)) return '0-0';
    const counts = categories.reduce((acc, c) => {
      if (c.winner !== 1 && c.winner !== 2 && c.winner !== 'tie') return acc;
      if (c.winner === 1) acc[0]++;
      else if (c.winner === 2) acc[1]++;
      return acc;
    }, [0, 0]);
    return `${counts[0]}-${counts[1]}`;
  };

  const renderComparison = () => {
    if (selectedHeroes.length !== 2) return null;
    const [hero1, hero2] = selectedHeroes;
    const stats = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];

    // If we have a backend result, use it to determine winners and overall
    const backend = comparisonResult;

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

        <div className="stats-comparison">
          {stats.map((stat, idx) => {
            const stat1 = hero1.powerstats[stat];
            const stat2 = hero2.powerstats[stat];
            let winner = 'tie';
            if (backend && backend.categories && backend.categories[idx]) {
              const w = backend.categories[idx].winner;
              winner = w === 1 ? 'hero1' : w === 2 ? 'hero2' : 'tie';
            } else {
              winner = stat1 > stat2 ? 'hero1' : stat1 < stat2 ? 'hero2' : 'tie';
            }

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

        <div className="final-result">
          <h2>Final Result</h2>
          {comparisonResult ? (
            comparisonResult.overall_winner === 'tie' ? (
              <div className="tie-announcement">
                <h3>🤝 It's a Tie!</h3>
                <p>Score: {buildScoreString(comparisonResult.categories)}</p>
              </div>
            ) : (
              <div className="winner-announcement">
                <h3>🏆 {(comparisonResult.overall_winner === 1 ? hero1.name : hero2.name)} Wins!</h3>
                <p>Score: {buildScoreString(comparisonResult.categories)}</p>
              </div>
            )
          ) : (
            <div className="tie-announcement">
              <h3>🤝 It's a Tie!</h3>
              <p>Score: 0-0</p>
            </div>
          )}
        </div>
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
          disabled={selectedHeroes.length !== 2}
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
      {showLogin ? (
        <Login onLogin={() => setShowLogin(false)} />
      ) : (
        <header className="App-header">
          {currentView === 'table' ? renderTable() : renderComparison()}
        </header>
      )}
    </div>
  );
}

export default App;
