import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const formatDate = (date, formatStr = 'PPp') => {
  if (!date) return 'N/A';
  return format(new Date(date), formatStr);
};

export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const calculateStrikeRate = (runs, balls) => {
  if (!balls || balls === 0) return 0;
  return ((runs / balls) * 100).toFixed(2);
};

export const calculateEconomy = (runs, overs) => {
  if (!overs || overs === 0) return 0;
  return (runs / overs).toFixed(2);
};

export const calculateAverage = (runs, outs) => {
  if (!outs || outs === 0) return runs || 0;
  return (runs / outs).toFixed(2);
};

export const formatOvers = (balls) => {
  const overs = Math.floor(balls / 6);
  const remainingBalls = balls % 6;
  return remainingBalls === 0 ? overs.toString() : `${overs}.${remainingBalls}`;
};

export const getPlayerFullName = (player) => {
  if (!player) return 'Unknown Player';
  return `${player.firstName} ${player.lastName}`.trim();
};

export const getTeamScoreDisplay = (innings) => {
  if (!innings) return 'Yet to bat';
  const { runs, wickets, overs } = innings;
  return `${runs}/${wickets} (${formatOvers(overs)})`;
};

export const getMatchResult = (match) => {
  if (!match || match.status !== 'completed') return null;
  
  const { team1, team2, innings1, innings2 } = match;
  
  if (!innings1 || !innings2) return 'Match abandoned';
  
  if (innings1.runs > innings2.runs) {
    const margin = innings1.runs - innings2.runs;
    return `${team1?.name} won by ${margin} runs`;
  } else if (innings2.runs > innings1.runs) {
    const wickets = 10 - innings2.wickets;
    return `${team2?.name} won by ${wickets} wickets`;
  } else {
    return 'Match tied';
  }
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};