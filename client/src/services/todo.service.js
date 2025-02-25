import WrapperService from './wrapper.service';

const API_URL = import.meta.env.VITE_API_URL;

class TodoService extends WrapperService {
  async findByList(listId, password = undefined) {
    return this.requestHandler(() =>
      fetch(`${API_URL}/todos/${listId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      }),
    );
  }
}

const todoService = new TodoService();

export default todoService;
