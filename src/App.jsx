import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

export default function App() {
  // Состояние для задач
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTask, setNewTask] = useState('');

  // Состояние для API
  const [pokemons, setPokemons] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Функция для получения случайного числа
  const getRandomOffset = () => Math.floor(Math.random() * 800); // Всего ~1000 покемонов

  // Загрузка данных
  const fetchData = async () => {
    try {
      setLoading(true);
      setApiError(null);

      // Загрузка случайных покемонов
      const pokemonResponse = await axios.get(
        `https://pokeapi.co/api/v2/pokemon?limit=2&offset=${getRandomOffset()}`
      );
      const pokemonDetails = await Promise.all(
        pokemonResponse.data.results.map(async (pokemon) => {
          try {
            const res = await axios.get(pokemon.url);
            return {
              name: res.data.name,
              image: res.data.sprites.other['official-artwork'].front_default || '/placeholder.png',
              type: res.data.types[0]?.type.name || 'unknown'
            };
          } catch {
            return {
              name: pokemon.name,
              image: '/placeholder.png',
              type: 'unknown'
            };
          }
        })
      );
      setPokemons(pokemonDetails);

      // Загрузка собак
      const dogsResponse = await axios.get('https://dog.ceo/api/breeds/image/random/2');
      setDogs(dogsResponse.data.message);

    } catch (error) {
      setApiError('Ошибка загрузки данных. Проверьте подключение к интернету.');
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Сохранение задач
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Добавление задачи
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

  // Обработка нажатия Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  // Переключение статуса задачи
  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Удаление задачи
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="app">
      <div className="dashboard">
        {/* Боковая панель с API */}
        <div className="info-sidebar">
          <div className="api-card">
            <h3>Случайные покемоны</h3>
            {apiError ? (
              <div className="error">
                {apiError}
                <button onClick={fetchData} className="retry-btn">Повторить</button>
              </div>
            ) : loading ? (
              <div className="loading">Загрузка...</div>
            ) : (
              <div className="pokemon-list">
                {pokemons.map((pokemon, index) => (
                  <div key={index} className="pokemon-item">
                    <img 
                      src={pokemon.image} 
                      alt={pokemon.name}
                      className="pokemon-image"
                      onError={(e) => e.target.src = '/placeholder.png'}
                    />
                    <div className="pokemon-info">
                      <h4>{pokemon.name}</h4>
                      <p>Тип: {pokemon.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="api-card">
            <h3>Случайные собаки</h3>
            {apiError ? (
              <div className="error">
                {apiError}
                <button onClick={fetchData} className="retry-btn">Повторить</button>
              </div>
            ) : loading ? (
              <div className="loading">Загрузка...</div>
            ) : (
              <div className="dogs-list">
                {dogs.map((dog, index) => (
                  <img
                    key={index}
                    src={dog}
                    alt="Случайная собака"
                    className="dog-image"
                    onError={(e) => e.target.src = '/placeholder.png'}
                  />
                ))}
              </div>
            )}
          </div>
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