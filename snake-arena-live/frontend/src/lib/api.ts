import { User, LeaderboardEntry, LivePlayer, AuthResponse, ApiResponse, GameMode } from '@/types/game';

const API_BASE = '/api';

const requestJson = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  try {
    const headers = new Headers(options.headers);
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      if (data && typeof data === 'object') {
        return data as T;
      }
      return { success: false, error: response.statusText || 'Request failed' } as T;
    }

    return data as T;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    } as T;
  }
};

export const api = {
  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    return requestJson<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async signup(email: string, username: string, password: string): Promise<AuthResponse> {
    return requestJson<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
  },

  async logout(): Promise<ApiResponse<null>> {
    return requestJson<ApiResponse<null>>('/auth/logout', {
      method: 'POST',
    });
  },

  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    return requestJson<ApiResponse<User | null>>('/auth/me');
  },

  // Leaderboard
  async getLeaderboard(mode?: GameMode): Promise<ApiResponse<LeaderboardEntry[]>> {
    const query = mode ? `?mode=${encodeURIComponent(mode)}` : '';
    return requestJson<ApiResponse<LeaderboardEntry[]>>(`/leaderboard${query}`);
  },

  async submitScore(score: number, mode: GameMode): Promise<ApiResponse<LeaderboardEntry>> {
    return requestJson<ApiResponse<LeaderboardEntry>>('/scores', {
      method: 'POST',
      body: JSON.stringify({ score, mode }),
    });
  },

  // Live Players
  async getLivePlayers(): Promise<ApiResponse<LivePlayer[]>> {
    return requestJson<ApiResponse<LivePlayer[]>>('/live-players');
  },

  async getLivePlayer(playerId: string): Promise<ApiResponse<LivePlayer | null>> {
    return requestJson<ApiResponse<LivePlayer | null>>(`/live-players/${encodeURIComponent(playerId)}`);
  },
};

export default api;
