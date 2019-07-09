import axios from 'axios';
import { key, searchUrl } from '../config';

export default class Search {
  constructor(query) {
    this.query = query;
  }

  async getResults() {
    try {
      const result = await axios(searchUrl, {
        params: {
          key,
          q: this.query
        }
      });
      this.result = result.data.recipes;
      // console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
}