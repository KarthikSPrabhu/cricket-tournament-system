const express = require('express');
const router = express.Router();
const playerController = require('../controllers/player.controller');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middleware/upload');

// Public routes
router.get('/', playerController.getPlayers);
router.get('/search', playerController.searchPlayers);
router.get('/:id', playerController.getPlayer);
router.get('/:id/statistics', playerController.getPlayerStatistics);

// Protected routes (Admin only)
router.post('/', 
  auth, 
  admin,
  upload.single('photo'), 
  playerController.createPlayer
);

router.put('/:id', 
  auth, 
  admin,
  upload.single('photo'), 
  playerController.updatePlayer
);

router.delete('/:id', auth, admin, playerController.deletePlayer);

module.exports = router;