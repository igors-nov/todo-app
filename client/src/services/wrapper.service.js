class WrapperService {
  async requestHandler(callFunc) {
    try {
      const response = await callFunc();

      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(text);
        });
      }

      const data = response.json();

      return data;
    } catch (e) {
      throw new Error(e);
    }
  }
}

export default WrapperService;
