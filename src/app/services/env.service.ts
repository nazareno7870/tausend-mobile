import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvService {
  FIRST_NAME = '';
  LAST_NAME = '';
  
  constructor() { }
}
