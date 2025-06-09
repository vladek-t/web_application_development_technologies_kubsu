import React, { useState } from 'react'

const ToDoForm = ({ addTask }) => {
  const [userInput, setUserInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    addTask(userInput)
    setUserInput('')
  }

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Введите задачу..."
        className="todo-input"
      />
      <button type="submit" className="todo-button">Добавить</button>
    </form>
  )
}

export default ToDoForm