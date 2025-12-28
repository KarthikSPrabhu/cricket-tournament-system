const axios = require('axios');
const BASE_URL = 'http://localhost:5000/api';

let authToken = '';
let adminId = '';
let teamId = '';
let playerId = '';
let tournamentId = '';
let matchId = '';

const testAPI = async () => {
  console.log('🚀 Starting Cricket Tournament API Tests\n');

  try {
    // 1. Test Authentication
    console.log('1. Testing Authentication...');
    
    // Register admin
    const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
      username: 'testadmin',
      email: 'test@cricket.com',
      password: 'test123'
    });
    console.log('✅ Admin registration successful');
    
    // Login
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@cricket.com',
      password: 'test123'
    });
    authToken = loginRes.data.token;
    adminId = loginRes.data.user.id;
    console.log('✅ Login successful');
    
    // Set auth header for subsequent requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

    // 2. Test Tournament Creation
    console.log('\n2. Testing Tournament Creation...');
    const tournamentRes = await axios.post(`${BASE_URL}/tournaments`, {
      name: 'Test Tournament 2024',
      tournamentId: 'TEST2024',
      season: '2024',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      format: 'T20',
      totalOvers: 20,
      maxPlayersPerTeam: 15,
      status: 'upcoming'
    });
    tournamentId = tournamentRes.data.tournament._id;
    console.log('✅ Tournament created');

    // 3. Test Team Creation
    console.log('\n3. Testing Team Creation...');
    const teamRes = await axios.post(`${BASE_URL}/teams`, {
      name: 'Test Team',
      teamId: 'TT2024',
      coach: 'Test Coach',
      homeGround: 'Test Stadium',
      foundedYear: 2024,
      tournamentId: tournamentId
    });
    teamId = teamRes.data.team._id;
    console.log('✅ Team created');

    // 4. Test Player Creation
    console.log('\n4. Testing Player Creation...');
    const playerRes = await axios.post(`${BASE_URL}/players`, {
      playerId: 'PLAYER001',
      name: 'Test Player',
      age: 25,
      phone: '9876543210',
      email: 'player@test.com',
      role: 'batsman',
      battingStyle: 'right-handed',
      teamId: teamId
    });
    playerId = playerRes.data.player._id;
    console.log('✅ Player created');

    // 5. Test Match Creation
    console.log('\n5. Testing Match Creation...');
    // Create another team for match
    const team2Res = await axios.post(`${BASE_URL}/teams`, {
      name: 'Test Team 2',
      teamId: 'TT22024',
      coach: 'Test Coach 2',
      tournamentId: tournamentId
    });
    const team2Id = team2Res.data.team._id;

    const matchRes = await axios.post(`${BASE_URL}/matches`, {
      tournamentId: tournamentId,
      team1: teamId,
      team2: team2Id,
      venue: 'Test Stadium',
      date: new Date().toISOString(),
      startTime: '15:30',
      matchType: 'group'
    });
    matchId = matchRes.data.match._id;
    console.log('✅ Match created');

    // 6. Test Toss Update
    console.log('\n6. Testing Toss Update...');
    await axios.post(`${BASE_URL}/matches/${matchId}/toss`, {
      tossWonBy: teamId,
      decision: 'bat'
    });
    console.log('✅ Toss updated');

    // 7. Test Public APIs
    console.log('\n7. Testing Public APIs...');
    
    const publicRes = await axios.get(`${BASE_URL}/public/live-matches`);
    console.log('✅ Live matches fetched');
    
    const leaderboardRes = await axios.get(`${BASE_URL}/public/leaderboard/batsmen`);
    console.log('✅ Leaderboard fetched');

    // 8. Test Data Retrieval
    console.log('\n8. Testing Data Retrieval...');
    
    const teamsRes = await axios.get(`${BASE_URL}/teams`);
    console.log(`✅ Teams fetched: ${teamsRes.data.teams.length}`);
    
    const playersRes = await axios.get(`${BASE_URL}/players`);
    console.log(`✅ Players fetched: ${playersRes.data.players.length}`);
    
    const tournamentsRes = await axios.get(`${BASE_URL}/tournaments`);
    console.log(`✅ Tournaments fetched: ${tournamentsRes.data.tournaments.length}`);

    console.log('\n🎉 All tests passed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Admin ID: ${adminId}`);
    console.log(`   Tournament ID: ${tournamentId}`);
    console.log(`   Team ID: ${teamId}`);
    console.log(`   Player ID: ${playerId}`);
    console.log(`   Match ID: ${matchId}`);

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('Error:', error.response?.data || error.message);
    process.exit(1);
  }
};

testAPI();