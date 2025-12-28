export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const PLAYER_ROLES = {
  BATSMAN: 'batsman',
  BOWLER: 'bowler',
  ALL_ROUNDER: 'all_rounder',
  WICKET_KEEPER: 'wicket_keeper'
};

export const BALL_TYPES = {
  NORMAL: 'normal',
  WIDE: 'wide',
  NO_BALL: 'no_ball',
  BYE: 'bye',
  LEG_BYE: 'leg_bye'
};

export const DISMISSAL_TYPES = {
  BOWLED: 'bowled',
  CAUGHT: 'caught',
  LBW: 'lbw',
  RUN_OUT: 'run_out',
  STUMPED: 'stumped',
  HIT_WICKET: 'hit_wicket',
  RETIRED_HURT: 'retired_hurt'
};

export const TOURNAMENT_FORMATS = {
  LEAGUE: 'league',
  KNOCKOUT: 'knockout',
  LEAGUE_KNOCKOUT: 'league_knockout'
};

export const STATS_TYPES = {
  BATSMAN: 'batsman',
  BOWLER: 'bowler',
  TEAM: 'team',
  MATCH: 'match'
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  DEFAULT_SORT: 'createdAt',
  DEFAULT_ORDER: 'desc'
};

export const CACHE_KEYS = {
  TEAMS: 'teams',
  PLAYERS: 'players',
  TOURNAMENTS: 'tournaments',
  MATCHES: 'matches',
  LIVE_MATCHES: 'live_matches',
  LEADERBOARD: 'leaderboard'
};

export const SOCKET_EVENTS = {
  BALL_UPDATE: 'ball-update',
  MATCH_STATUS: 'match-status',
  TOSS_UPDATE: 'toss-update',
  ACTIVE_MATCHES: 'active-matches-list',
  COMMENTARY: 'commentary-update'
};