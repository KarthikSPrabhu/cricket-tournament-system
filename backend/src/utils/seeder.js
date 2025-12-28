const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load models
const User = require('../models/User');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Tournament = require('../models/Tournament');
const Match = require('../models/Match');

dotenv.config();

const sampleTeams = [
  {
    name: 'Mumbai Indians',
    teamId: 'MI2024',
    coach: 'Mark Boucher',
    homeGround: 'Wankhede Stadium',
    foundedYear: 2008
  },
  {
    name: 'Chennai Super Kings',
    teamId: 'CSK2024',
    coach: 'Stephen Fleming',
    homeGround: 'MA Chidambaram Stadium',
    foundedYear: 2008
  },
  {
    name: 'Royal Challengers Bangalore',
    teamId: 'RCB2024',
    coach: 'Andy Flower',
    homeGround: 'M. Chinnaswamy Stadium',
    foundedYear: 2008
  },
  {
    name: 'Kolkata Knight Riders',
    teamId: 'KKR2024',
    coach: 'Chandrakant Pandit',
    homeGround: 'Eden Gardens',
    foundedYear: 2008
  },
  {
    name: 'Delhi Capitals',
    teamId: 'DC2024',
    coach: 'Ricky Ponting',
    homeGround: 'Arun Jaitley Stadium',
    foundedYear: 2008
  },
  {
    name: 'Punjab Kings',
    teamId: 'PBKS2024',
    coach: 'Trevor Bayliss',
    homeGround: 'PCA Stadium',
    foundedYear: 2008
  },
  {
    name: 'Rajasthan Royals',
    teamId: 'RR2024',
    coach: 'Kumar Sangakkara',
    homeGround: 'Sawai Mansingh Stadium',
    foundedYear: 2008
  },
  {
    name: 'Sunrisers Hyderabad',
    teamId: 'SRH2024',
    coach: 'Daniel Vettori',
    homeGround: 'Rajiv Gandhi Stadium',
    foundedYear: 2013
  }
];

const samplePlayers = [
  // Mumbai Indians
  { name: 'Rohit Sharma', playerId: 'MI001', age: 36, role: 'batsman', battingStyle: 'right-handed' },
  { name: 'Jasprit Bumrah', playerId: 'MI002', age: 30, role: 'bowler', bowlingStyle: 'right-arm fast' },
  { name: 'Suryakumar Yadav', playerId: 'MI003', age: 33, role: 'batsman', battingStyle: 'right-handed' },
  
  // Chennai Super Kings
  { name: 'MS Dhoni', playerId: 'CSK001', age: 42, role: 'wicketkeeper', battingStyle: 'right-handed' },
  { name: 'Ravindra Jadeja', playerId: 'CSK002', age: 35, role: 'allrounder', battingStyle: 'left-handed', bowlingStyle: 'left-arm spin' },
  { name: 'Ruturaj Gaikwad', playerId: 'CSK003', age: 26, role: 'batsman', battingStyle: 'right-handed' },
  
  // Royal Challengers Bangalore
  { name: 'Virat Kohli', playerId: 'RCB001', age: 35, role: 'batsman', battingStyle: 'right-handed' },
  { name: 'Glenn Maxwell', playerId: 'RCB002', age: 35, role: 'allrounder', battingStyle: 'right-handed', bowlingStyle: 'right-arm offbreak' },
  { name: 'Mohammed Siraj', playerId: 'RCB003', age: 29, role: 'bowler', bowlingStyle: 'right-arm fast' },
  
  // Kolkata Knight Riders
  { name: 'Shreyas Iyer', playerId: 'KKR001', age: 29, role: 'batsman', battingStyle: 'right-handed' },
  { name: 'Andre Russell', playerId: 'KKR002', age: 35, role: 'allrounder', battingStyle: 'right-handed', bowlingStyle: 'right-arm fast' },
  { name: 'Sunil Narine', playerId: 'KKR003', age: 35, role: 'allrounder', battingStyle: 'left-handed', bowlingStyle: 'right-arm offbreak' },
];

class DatabaseSeeder {
  constructor() {
    this.teams = [];
    this.players = [];
    this.tournament = null;
  }

  async connect() {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ MongoDB connected for seeding');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
    }
  }

  async clearDatabase() {
    console.log('🗑️  Clearing database...');
    await User.deleteMany({});
    await Team.deleteMany({});
    await Player.deleteMany({});
    await Tournament.deleteMany({});
    await Match.deleteMany({});
    console.log('✅ Database cleared');
  }

  async seedAdminUser() {
    try {
      const adminExists = await User.findOne({ email: 'admin@cricket.com' });
      
      if (!adminExists) {
        const admin = new User({
          username: 'admin',
          email: 'admin@cricket.com',
          password: 'admin123', // Will be hashed by pre-save hook
          role: 'admin',
          isActive: true
        });
        
        await admin.save();
        console.log('✅ Admin user created');
        console.log('📧 Email: admin@cricket.com');
        console.log('🔑 Password: admin123');
      } else {
        console.log('✅ Admin user already exists');
      }
    } catch (error) {
      console.error('❌ Error creating admin user:', error);
    }
  }

  async seedTeams() {
    console.log('🏏 Seeding teams...');
    
    for (const teamData of sampleTeams) {
      try {
        const team = new Team({
          ...teamData,
          matchesPlayed: 0,
          matchesWon: 0,
          matchesLost: 0,
          points: 0,
          netRunRate: 0
        });
        
        await team.save();
        this.teams.push(team);
        console.log(`✅ Created team: ${team.name}`);
      } catch (error) {
        console.error(`❌ Error creating team ${teamData.name}:`, error.message);
      }
    }
    
    console.log(`✅ Created ${this.teams.length} teams`);
  }

  async seedPlayers() {
    console.log('👤 Seeding players...');
    
    let playerIndex = 0;
    for (const team of this.teams) {
      // Add 3 players to each team
      for (let i = 0; i < 3; i++) {
        if (playerIndex < samplePlayers.length) {
          const playerData = samplePlayers[playerIndex];
          
          try {
            const player = new Player({
              ...playerData,
              email: `${playerData.playerId.toLowerCase()}@cricket.com`,
              phone: `9876543${100 + playerIndex}`,
              team: team._id,
              statistics: {
                matches: Math.floor(Math.random() * 10) + 1,
                runs: Math.floor(Math.random() * 500),
                wickets: playerData.role.includes('bowler') ? Math.floor(Math.random() * 20) : 0,
                catches: Math.floor(Math.random() * 10)
              }
            });
            
            await player.save();
            this.players.push(player);
            
            // Add player to team
            team.players.push(player._id);
            await team.save();
            
            console.log(`✅ Created player: ${player.name} (${team.name})`);
          } catch (error) {
            console.error(`❌ Error creating player ${playerData.name}:`, error.message);
          }
          
          playerIndex++;
        }
      }
    }
    
    console.log(`✅ Created ${this.players.length} players`);
  }

  async seedTournament() {
    console.log('🏆 Seeding tournament...');
    
    try {
      const tournament = new Tournament({
        name: 'Indian Premier League 2024',
        tournamentId: 'IPL2024',
        season: '2024',
        startDate: new Date('2024-03-22'),
        endDate: new Date('2024-05-26'),
        format: 'T20',
        totalOvers: 20,
        maxPlayersPerTeam: 15,
        status: 'ongoing',
        teams: this.teams.map(team => team._id)
      });
      
      await tournament.save();
      this.tournament = tournament;
      
      // Update teams with tournament ID
      await Team.updateMany(
        { _id: { $in: this.teams.map(t => t._id) } },
        { $set: { tournamentId: tournament._id } }
      );
      
      // Update players with tournament ID
      await Player.updateMany(
        { _id: { $in: this.players.map(p => p._id) } },
        { $set: { tournamentId: tournament._id } }
      );
      
      console.log('✅ Created tournament:', tournament.name);
    } catch (error) {
      console.error('❌ Error creating tournament:', error);
    }
  }

  async seedMatches() {
    console.log('🎯 Seeding matches...');
    
    try {
      // Create some sample matches
      const matchesData = [
        {
          matchId: 'MATCH001',
          matchNumber: 1,
          tournamentId: this.tournament._id,
          team1: this.teams[0]._id, // MI
          team2: this.teams[1]._id, // CSK
          venue: 'Wankhede Stadium',
          date: new Date('2024-03-22'),
          startTime: '19:30',
          matchType: 'group',
          status: 'completed',
          result: {
            wonBy: this.teams[0]._id,
            margin: '20 runs',
            method: 'runs'
          }
        },
        {
          matchId: 'MATCH002',
          matchNumber: 2,
          tournamentId: this.tournament._id,
          team1: this.teams[2]._id, // RCB
          team2: this.teams[3]._id, // KKR
          venue: 'M. Chinnaswamy Stadium',
          date: new Date('2024-03-23'),
          startTime: '15:30',
          matchType: 'group',
          status: 'scheduled'
        },
        {
          matchId: 'MATCH003',
          matchNumber: 3,
          tournamentId: this.tournament._id,
          team1: this.teams[4]._id, // DC
          team2: this.teams[5]._id, // PBKS
          venue: 'Arun Jaitley Stadium',
          date: new Date('2024-03-24'),
          startTime: '19:30',
          matchType: 'group',
          status: 'live',
          currentInning: 1,
          currentOver: 12,
          currentBall: 3
        }
      ];
      
      for (const matchData of matchesData) {
        const match = new Match(matchData);
        await match.save();
        
        // Add match to tournament
        this.tournament.matches.push(match._id);
        
        console.log(`✅ Created match: ${matchData.team1?.name || 'Team 1'} vs ${matchData.team2?.name || 'Team 2'}`);
      }
      
      await this.tournament.save();
      console.log('✅ Created 3 sample matches');
    } catch (error) {
      console.error('❌ Error creating matches:', error);
    }
  }

  async run() {
    try {
      await this.connect();
      
      console.log('🚀 Starting database seeding...\n');
      
      await this.clearDatabase();
      console.log('');
      
      await this.seedAdminUser();
      console.log('');
      
      await this.seedTeams();
      console.log('');
      
      await this.seedPlayers();
      console.log('');
      
      await this.seedTournament();
      console.log('');
      
      await this.seedMatches();
      console.log('');
      
      console.log('🎉 Database seeding completed successfully!');
      console.log('\n📊 Summary:');
      console.log(`   👑 Admin user created`);
      console.log(`   🏏 ${this.teams.length} teams created`);
      console.log(`   👤 ${this.players.length} players created`);
      console.log(`   🏆 1 tournament created`);
      console.log(`   🎯 3 matches created`);
      console.log('\n🔗 Login credentials:');
      console.log('   📧 Email: admin@cricket.com');
      console.log('   🔑 Password: admin123');
      console.log('\n✅ Seeding complete. You can now run the application.');
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    }
  }
}

// Run seeder if called directly
if (require.main === module) {
  const seeder = new DatabaseSeeder();
  seeder.run();
}

module.exports = DatabaseSeeder;