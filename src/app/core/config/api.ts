import { InjectionToken } from '@angular/core';
export const API_URL = new InjectionToken<string>('API_URL');

export const API_LOCAL: string = 'http://localhost:300/tasks';

// JSONBin.io configuration
export const JSONBIN_BASE_URL = 'https://api.jsonbin.io/v3/b';

export const MOCK_API: string = 'https://68edac67df2025af7800c70c.mockapi.io/api/tasks';
