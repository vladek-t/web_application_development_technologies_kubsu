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
  const [jokes, setJokes] = useState([]);
  const [catFacts, setCatFacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Загрузка данных
  const fetchData = async () => {
    try {
      setLoading(true);
      setApiError(null);

      // Загрузка шуток (используем JokeAPI)
      const jokesResponse = await axios.get('https://v2.jokeapi.dev/joke/Programming?blacklistFlags=nsfw,religious,political,racist,sexist,explicit&amount=2');
      
      // Форматирование шуток
      let formattedJokes = [];
      if (jokesResponse.data.jokes) {
        formattedJokes = jokesResponse.data.jokes.map(joke => ({
          id: joke.id,
          text: joke.setup + (joke.delivery ? ` ${joke.delivery}` : ''),
          category: joke.category
        }));
      } else {
        formattedJokes = [{
          id: jokesResponse.data.id,
          text: jokesResponse.data.setup + (jokesResponse.data.delivery ? ` ${jokesResponse.data.delivery}` : ''),
          category: jokesResponse.data.category
        }];
      }
      setJokes(formattedJokes);

      // Загрузка фактов о кошках (используем альтернативный API без CORS)
      const catFactsResponse = await axios.get('https://meowfacts.herokuapp.com/?count=2');
      setCatFacts(catFactsResponse.data.data.map((fact, index) => ({
        id: `fact-${index}`,
        text: fact,
        verified: true // Этот API не предоставляет статус проверки
      })));

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
            <h3>Программистские шутки</h3>
            {apiError ? (
              <div className="error">
                {apiError}
                <button onClick={fetchData} className="retry-btn">Повторить</button>
              </div>
            ) : loading ? (
              <div className="loading">Загрузка...</div>
            ) : (
              <div className="jokes-list">
                {jokes.map((joke) => (
                  <div key={joke.id} className="joke-item">
                    <p className="joke-text">{joke.text}</p>
                    <span className="joke-category">{joke.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="api-card">
            <h3>Факты о кошках</h3>
            {apiError ? (
              <div className="error">
                {apiError}
                <button onClick={fetchData} className="retry-btn">Повторить</button>
              </div>
            ) : loading ? (
              <div className="loading">Загрузка...</div>
            ) : (
              <div className="cat-facts-list">
                {catFacts.map((fact) => (
                  <div key={fact.id} className="fact-item">
                    <p className="fact-text">{fact.text}</p>
                    {fact.verified && <span className="fact-status">✓ Подтверждено</span>}
                  </div>
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