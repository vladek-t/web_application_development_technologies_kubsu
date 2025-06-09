import React from 'react'

const ToDo = ({ todo, toggleTask, removeTask }) => {
  return (
    <div className={`item-todo ${todo.complete ? 'item-complete' : ''}`}>
      <div 
        className="item-text"
        onClick={() => toggleTask(todo.id)}
      >
        {todo.task}
      </div>
      <button 
        className="item-delete"
        onClick={() => removeTask(todo.id)}
      >
        ×
      </button>
    </div>
  )
}

export default ToDo