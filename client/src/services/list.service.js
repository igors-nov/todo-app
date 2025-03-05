import WrapperService from './wrapper.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ListService extends WrapperService {
  async login(uniqueUrl, password) {
    return this.requestHandler(() =>
      fetch(`${API_URL}/lists/${uniqueUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      }),
    );
  }

  async findOne(uniqueUrl, accessToken) {
    return this.requestHandler(() =>
      fetch(`${API_URL}/lists/${uniqueUrl}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + accessToken },
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

  async deleteList(uniqueUrl, accessToken) {
    return fetch(`${API_URL}/lists/${uniqueUrl}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + accessToken },
    });
  }

  async toggleFreeze(uniqueUrl, accessToken) {
    return this.requestHandler(() =>
      fetch(`${API_URL}/lists/${uniqueUrl}/freeze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + accessToken },
      }),
    );
  }
}

const listService = new ListService();

export default listService;
