import WrapperService from './wrapper.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class TodoService extends WrapperService {
  async findByList(listId, accessToken) {
    return this.requestHandler(() =>
      fetch(`${API_URL}/todos/${listId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + accessToken },
      }),
    );
  }
}

const todoService = new TodoService();

export default todoService;
