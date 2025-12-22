import { Injectable } from '@angular/core';

declare global {
  function sendRq(method: string, url?: string, params?: any): Promise<{
    status: number;
    data?: any;
    err?: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  async sendRq(method: string, url: string = "", params: any = {}) {
    return await sendRq(method, url, params);
  }
}
