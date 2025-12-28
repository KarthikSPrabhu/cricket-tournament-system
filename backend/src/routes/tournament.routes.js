const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournament.controller');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middleware/upload');

// Public routes
router.get('/', tournamentController.getTournaments);
router.get('/:id', tournamentController.getTournament);
router.get('/:id/standings', tournamentController.getTournamentStandings);
router.get('/:id/statistics', tournamentController.getTournamentStatistics);

// Protected routes (Admin only)
router.post('/', auth, admin, tournamentController.createTournament);
router.put('/:id', auth, admin, tournamentController.updateTournament);
router.delete('/:id', auth, admin, tournamentController.deleteTournament);

// Tournament team management
router.post('/:id/teams', auth, admin, tournamentController.addTeamToTournament);
router.delete('/:id/teams/:teamId', auth, admin, tournamentController.removeTeamFromTournament);

// Tournament media
router.post('/:id/media', 
  auth, 
  admin,
  upload.array('media', 10), 
  tournamentController.uploadTournamentMedia
);

module.exports = router;