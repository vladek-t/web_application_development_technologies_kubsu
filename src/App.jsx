import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  
  const [newTask, setNewTask] = useState('');
  const [rates, setRates] = useState({ usd: '...', eur: '...' });
  const [weather, setWeather] = useState(null);

  // Функция для направления ветра
  const getWindDirection = (degrees) => {
    const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    // Курс валют
    axios.get('https://www.cbr-xml-daily.ru/daily_json.js')
      .then(res => {
        setRates({
          usd: res.data.Valute.USD.Value.toFixed(2),
          eur: res.data.Valute.EUR.Value.toFixed(2)
        });
      });

    // Погода
    navigator.geolocation.getCurrentPosition(pos => {
      axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=c7616da4b68205c2f3ae73df2c31d177&units=metric&lang=ru`)
        .then(res => setWeather(res.data));
    });
  }, []);

  // Сохранение задач при изменении
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, {
        id: Date.now(),
        text: newTask,
        completed: false
      }]);
      setNewTask('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="app">
      <div className="dashboard">
        {/* Боковая панель */}
        <div className="info-sidebar">
          <div className="currency-card">
            <h3>Курс валют</h3>
            <div className="rates">
              <div className="rate">
                <span className="currency-icon">$</span>
                <span>{rates.usd} ₽</span>
              </div>
              <div className="rate">
                <span className="currency-icon">€</span>
                <span>{rates.eur} ₽</span>
              </div>
            </div>
          </div>

          {weather && (
            <div className="weather-card">
              <h3>Погода</h3>
              <div className="weather-info">
                <span className="weather-icon">
                  {weather.weather[0].main === 'Clear' ? '☀️' : 
                   weather.weather[0].main === 'Rain' ? '🌧️' : 
                   weather.weather[0].main === 'Clouds' ? '☁️' : '🌈'}
                </span>
                <div className="weather-details">
                  <div className="temp">{Math.round(weather.main.temp)}°C</div>
                  <div className="desc">{weather.weather[0].description}</div>
                  <div className="weather-extra">
                    <div className="wind">
                      <span role="img" aria-label="wind">🌬️</span> 
                      {weather.wind.speed} м/с
                      {weather.wind.deg && `, ${getWindDirection(weather.wind.deg)}`}
                    </div>
                    <div className="clouds">
                      <span role="img" aria-label="clouds">☁️</span> 
                      {weather.clouds.all}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Основной блок задач */}
        <div className="tasks-main">
          <h2>Мои задачи</h2>
          <div className="task-input-container">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Добавьте новую задачу..."
              className="task-input"
            />
            <button onClick={addTask} className="add-btn">Добавить</button>
          </div>
          <div className="tasks-list">
            {tasks.length > 0 ? (
              tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`task ${task.completed ? 'completed' : ''}`}
                >
                  <span 
                    onClick={() => toggleTask(task.id)}
                    className="task-text"
                  >
                    {task.text}
                  </span>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="delete-btn"
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-tasks">Нет задач, добавьте первую!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}