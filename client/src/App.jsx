import TodoList from './pages/TodoList';
import { Route, Routes } from 'react-router-dom';
import CreateList from './pages/CreateList';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/lists/:uniqueUrl" element={<TodoList />} />
        <Route path="/" element={<CreateList />} />
      </Routes>
    </div>
  );
}

export default App;
