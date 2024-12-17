import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('https://cryptobackend-screener-production.up.railway.app'); // Connect to the backend Socket.IO server

function App() {
  const [volumeData, setVolumeData] = useState({});
  const [filterValue, setFilterValue] = useState(1); // Default filter value

  useEffect(() => {
    // Listen for 'volumeData' events from the backend
    socket.on('volumeData', (data) => {
    //  console.log('Received volume data:', data);

      // Organize data by symbol and timeframe
      setVolumeData((prevData) => {
        const updatedData = { ...prevData };
        const { symbol, timeframe, latestVolume, relativeVolume } = data;

        if (!updatedData[symbol]) {
          updatedData[symbol] = {};
        }

        updatedData[symbol][timeframe] = {
          latestVolume: latestVolume || 0,
          relativeVolume: relativeVolume || 'N/A',
        };

        return updatedData;
      });
    });

    // Cleanup listener on component unmount
    return () => {
      socket.off('volumeData');
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Binance Volume Screener</h1>

        {/* Filter Dropdown */}
        <div className="filter-container">
          <label htmlFor="relativeVolumeFilter">Select Relative Volume (0 to 15): </label>
          <select
            id="relativeVolumeFilter"
            value={filterValue}
            onChange={(e) => setFilterValue(Number(e.target.value))}
          >
            {Array.from({ length: 15 }, (_, i) => i + 0).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <table className="volume-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>1m Volume</th>
              <th>1m Relative Volume</th>
              <th>5m Volume</th>
              <th>5m Relative Volume</th>
              <th>15m Volume</th>
              <th>15m Relative Volume</th>
              <th>1hr Volume</th>
              <th>1hr Relative Volume</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(volumeData)
              .filter(([, timeframes]) => {
                // Check if any relative volume meets or exceeds the filter value
                return ['1m', '5m', '15m', '1hr'].some(
                  (timeframe) =>
                    typeof timeframes[timeframe]?.relativeVolume === 'number' &&
                    timeframes[timeframe].relativeVolume >= filterValue
                );
              })
              .sort(([, a], [, b]) => {
                const relativeA = typeof a['1m']?.relativeVolume === 'number' ? a['1m'].relativeVolume : -Infinity;
                const relativeB = typeof b['1m']?.relativeVolume === 'number' ? b['1m'].relativeVolume : -Infinity;
                return relativeB - relativeA; // Sort descending by 1m Relative Volume
              })
              .map(([symbol, timeframes]) => (
                <tr key={symbol}>
                  <td>{symbol}</td>
                  <td>{timeframes['1m']?.latestVolume ?? 'N/A'}</td>
                  <td>
                    {typeof timeframes['1m']?.relativeVolume === 'number'
                      ? timeframes['1m'].relativeVolume.toFixed(2)
                      : 'N/A'}
                  </td>
                  <td>{timeframes['5m']?.latestVolume ?? 'N/A'}</td>
                  <td>
                    {typeof timeframes['5m']?.relativeVolume === 'number'
                      ? timeframes['5m'].relativeVolume.toFixed(2)
                      : 'N/A'}
                  </td>
                  <td>{timeframes['15m']?.latestVolume ?? 'N/A'}</td>
                  <td>
                    {typeof timeframes['15m']?.relativeVolume === 'number'
                      ? timeframes['15m'].relativeVolume.toFixed(2)
                      : 'N/A'}
                  </td>
                  <td>{timeframes['1hr']?.latestVolume ?? 'N/A'}</td>
                  <td>
                    {typeof timeframes['1hr']?.relativeVolume === 'number'
                      ? timeframes['1hr'].relativeVolume.toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </header>
    </div>
  );
}

export default App;
