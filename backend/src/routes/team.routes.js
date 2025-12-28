const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middleware/upload');

// Public routes
router.get('/', teamController.getTeams);
router.get('/:id', teamController.getTeam);
router.get('/:id/stats', teamController.getTeamStats);

// Protected routes (Admin only)
router.post('/', 
  auth, 
  admin,
  upload.single('logo'), 
  teamController.createTeam
);

router.put('/:id', 
  auth, 
  admin,
  upload.single('logo'), 
  teamController.updateTeam
);

router.delete('/:id', auth, admin, teamController.deleteTeam);

// Team player management
router.post('/:id/players', auth, admin, teamController.addPlayerToTeam);
router.delete('/:id/players/:playerId', auth, admin, teamController.removePlayerFromTeam);

module.exports = router;