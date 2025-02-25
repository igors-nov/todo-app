import WrapperService from './wrapper.service';

const API_URL = import.meta.env.VITE_API_URL;

class ListService extends WrapperService {
  async findOne(uniqueUrl, password = '') {
    return this.requestHandler(() =>
      fetch(`${API_URL}/lists/${uniqueUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      }),
    );
  }

  async createList(list) {
    return this.requestHandler(() =>
      fetch(`${API_URL}/lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(list),
      }),
    );
  }

  async passwordCheck(uniqueUrl, password) {
    return this.requestHandler(() =>
      fetch(`${API_URL}/lists/${uniqueUrl}/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      }),
    );
  }

  async deleteList(uniqueUrl, password) {
    return fetch(`${API_URL}/lists/${uniqueUrl}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
  }

  async toggleFreeze(uniqueUrl, password) {
    return this.requestHandler(() =>
      fetch(`${API_URL}/lists/${uniqueUrl}/freeze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      }),
    );
  }
}

const listService = new ListService();

export default listService;
