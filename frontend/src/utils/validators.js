export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateName = (name) => {
  return name.trim().length >= 2;
};

export const validatePhone = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone);
};

export const validatePlayerForm = (data) => {
  const errors = {};
  
  if (!validateName(data.firstName)) {
    errors.firstName = 'First name must be at least 2 characters';
  }
  
  if (!validateName(data.lastName)) {
    errors.lastName = 'Last name must be at least 2 characters';
  }
  
  if (!data.team) {
    errors.team = 'Team is required';
  }
  
  if (!data.role) {
    errors.role = 'Role is required';
  }
  
  if (data.battingStyle && data.battingStyle.trim().length < 2) {
    errors.battingStyle = 'Batting style must be at least 2 characters';
  }
  
  if (data.bowlingStyle && data.bowlingStyle.trim().length < 2) {
    errors.bowlingStyle = 'Bowling style must be at least 2 characters';
  }
  
  return errors;
};

export const validateTeamForm = (data) => {
  const errors = {};
  
  if (!validateName(data.name)) {
    errors.name = 'Team name must be at least 2 characters';
  }
  
  if (!data.shortName || data.shortName.trim().length < 2) {
    errors.shortName = 'Short name must be at least 2 characters';
  }
  
  if (!data.coachName || data.coachName.trim().length < 2) {
    errors.coachName = 'Coach name must be at least 2 characters';
  }
  
  return errors;
};

export const validateTournamentForm = (data) => {
  const errors = {};
  
  if (!validateName(data.name)) {
    errors.name = 'Tournament name must be at least 2 characters';
  }
  
  if (!data.format) {
    errors.format = 'Format is required';
  }
  
  if (!data.startDate) {
    errors.startDate = 'Start date is required';
  }
  
  if (!data.endDate) {
    errors.endDate = 'End date is required';
  }
  
  if (new Date(data.startDate) > new Date(data.endDate)) {
    errors.endDate = 'End date must be after start date';
  }
  
  if (!data.teams || data.teams.length < 2) {
    errors.teams = 'At least 2 teams are required';
  }
  
  return errors;
};

export const validateMatchForm = (data) => {
  const errors = {};
  
  if (!data.tournament) {
    errors.tournament = 'Tournament is required';
  }
  
  if (!data.team1) {
    errors.team1 = 'Team 1 is required';
  }
  
  if (!data.team2) {
    errors.team2 = 'Team 2 is required';
  }
  
  if (data.team1 === data.team2) {
    errors.team2 = 'Teams must be different';
  }
  
  if (!data.date) {
    errors.date = 'Match date is required';
  }
  
  if (!data.venue) {
    errors.venue = 'Venue is required';
  }
  
  if (!data.overs) {
    errors.overs = 'Overs are required';
  }
  
  if (data.overs < 1 || data.overs > 50) {
    errors.overs = 'Overs must be between 1 and 50';
  }
  
  return errors;
};