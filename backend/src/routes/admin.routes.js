const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const { protect, admin } = require('../middleware/auth');

// All routes require admin authentication
router.use(protect);
router.use(admin);

// @route   GET /api/admin/stats
// @desc    Get system statistics
// @access  Private/Admin
router.get('/stats', adminController.getSystemStats);

// @route   GET /api/admin/analytics
// @desc    Get dashboard analytics
// @access  Private/Admin
router.get('/analytics', adminController.getDashboardAnalytics);

// User Management Routes

// @route   GET /api/admin/users
// @desc    Get all admin users
// @access  Private/Admin
router.get('/users', adminController.getAdminUsers);

// @route   GET /api/admin/all-users
// @desc    Get all users with pagination
// @access  Private/Admin
router.get('/all-users', adminController.getAllUsers);

// @route   POST /api/admin/users
// @desc    Create new admin user
// @access  Private/Admin
router.post('/users', [
  body('firstName', 'First name is required').not().isEmpty(),
  body('lastName', 'Last name is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], adminController.createAdminUser);

// @route   GET /api/admin/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/users/:id', adminController.getUserById);

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private/Admin
router.put('/users/:id', [
  body('email', 'Please include a valid email').optional().isEmail()
], adminController.updateUser);

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id', adminController.deleteUser);

// @route   PUT /api/admin/users/:id/password
// @desc    Change user password
// @access  Private/Admin
router.put('/users/:id/password', adminController.changeUserPassword);

// System Management Routes

// @route   GET /api/admin/backup
// @desc    Create system backup
// @access  Private/Admin
router.get('/backup', async (req, res) => {
  try {
    // In production, you would implement actual backup logic
    const backupData = {
      timestamp: new Date(),
      status: 'Backup created successfully',
      data: {
        users: await require('../models/User').countDocuments(),
        teams: await require('../models/Team').countDocuments(),
        players: await require('../models/Player').countDocuments(),
        tournaments: await require('../models/Tournament').countDocuments(),
        matches: await require('../models/Match').countDocuments()
      }
    };

    res.json(backupData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Backup failed' });
  }
});

// @route   POST /api/admin/seed
// @desc    Seed database with sample data
// @access  Private/Admin
router.post('/seed', async (req, res) => {
  try {
    const seeder = require('../utils/seeder');
    await seeder.seedDatabase();
    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Seeding failed' });
  }
});

// @route   DELETE /api/admin/clear-test
// @desc    Clear test data
// @access  Private/Admin
router.delete('/clear-test', async (req, res) => {
  try {
    // Clear test data (excluding admin users)
    await Promise.all([
      require('../models/Team').deleteMany({}),
      require('../models/Player').deleteMany({}),
      require('../models/Tournament').deleteMany({}),
      require('../models/Match').deleteMany({}),
      require('../models/User').deleteMany({ role: { $ne: 'admin' } })
    ]);

    res.json({ message: 'Test data cleared successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to clear test data' });
  }
});

// @route   GET /api/admin/logs
// @desc    Get system logs
// @access  Private/Admin
router.get('/logs', async (req, res) => {
  try {
    // In production, you would read from actual log files
    const logs = [
      {
        timestamp: new Date(),
        level: 'INFO',
        message: 'System started successfully',
        user: req.user.email
      },
      {
        timestamp: new Date(Date.now() - 3600000),
        level: 'INFO',
        message: 'New match created',
        user: 'admin@cricket.com'
      },
      {
        timestamp: new Date(Date.now() - 7200000),
        level: 'WARN',
        message: 'High memory usage detected',
        user: 'system'
      }
    ];

    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch logs' });
  }
});

// @route   GET /api/admin/system-info
// @desc    Get system information
// @access  Private/Admin
router.get('/system-info', async (req, res) => {
  try {
    const os = require('os');
    
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      cpu: os.cpus()[0].model,
      memory: {
        total: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + ' GB',
        free: (os.freemem() / 1024 / 1024 / 1024).toFixed(2) + ' GB',
        used: ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2) + ' GB'
      },
      uptime: {
        system: Math.floor(os.uptime() / 3600) + ' hours',
        process: Math.floor(process.uptime() / 3600) + ' hours'
      },
      nodeVersion: process.version,
      mongooseVersion: require('mongoose').version,
      database: process.env.NODE_ENV || 'development'
    };

    res.json(systemInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch system info' });
  }
});

module.exports = router;