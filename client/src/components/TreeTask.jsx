import ReactMarkdown from 'react-markdown';

export default function TreeTask(params) {
  const { list, todo, passwordAccepted, handleUpdateTodo, setAddSubtaskModal, setDeleteTaskModal, handleEditDescription } = params;

  return (
    <div>
      <div className="flex items-center space-x-2">
        <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>{todo.title}</span>
        {(list.protection === 1 || passwordAccepted) && !list.frozen && (
          <>
            <button
              className={`mt-2 px-2 py-1 text-white rounded ${todo.completed ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}`}
              onClick={() => handleUpdateTodo(todo.id, todo.completed)}
            >
              {todo.completed ? 'Incomplete' : 'Complete'}
            </button>
            <button onClick={() => setAddSubtaskModal(todo.id)} className="mt-2 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-500">
              Add Subtask
            </button>
            <button onClick={() => setDeleteTaskModal(todo.id)} className="mt-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-500">
              Delete
            </button>
          </>
        )}
      </div>
      <div className="mt-2 ml-6">
        <div onClick={() => handleEditDescription(todo.id, todo.description)} className="cursor-pointer disable-tailwind">
          {todo.description && todo.description.length > 0 && <ReactMarkdown>{todo.description.replace(/\n/gi, '  \n')}</ReactMarkdown>}
          {!todo.description && (list.protection === 1 || passwordAccepted) && !list.frozen && <p className="text-gray-500">Click to add a description...</p>}
        </div>
      </div>
    </div>
  );
}
