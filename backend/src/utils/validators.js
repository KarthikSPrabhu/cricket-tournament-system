const { body, param, query } = require('express-validator');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Tournament = require('../models/Tournament');

// Team validation rules
const teamValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Team name is required')
      .isLength({ min: 3 }).withMessage('Team name must be at least 3 characters')
      .custom(async (value) => {
        const team = await Team.findOne({ name: value });
        if (team) {
          throw new Error('Team name already exists');
        }
        return true;
      }),
    
    body('teamId')
      .trim()
      .notEmpty().withMessage('Team ID is required')
      .isUppercase().withMessage('Team ID must be uppercase')
      .custom(async (value) => {
        const team = await Team.findOne({ teamId: value });
        if (team) {
          throw new Error('Team ID already exists');
        }
        return true;
      }),
    
    body('coach')
      .optional()
      .trim()
      .isLength({ min: 3 }).withMessage('Coach name must be at least 3 characters'),
    
    body('foundedYear')
      .optional()
      .isInt({ min: 1800, max: new Date().getFullYear() })
      .withMessage('Invalid founded year'),
    
    body('tournamentId')
      .optional()
      .isMongoId().withMessage('Invalid tournament ID')
  ],

  update: [
    param('id').isMongoId().withMessage('Invalid team ID'),
    
    body('name')
      .optional()
      .trim()
      .isLength({ min: 3 }).withMessage('Team name must be at least 3 characters')
      .custom(async (value, { req }) => {
        const team = await Team.findOne({ name: value, _id: { $ne: req.params.id } });
        if (team) {
          throw new Error('Team name already exists');
        }
        return true;
      }),
    
    body('teamId')
      .optional()
      .trim()
      .isUppercase().withMessage('Team ID must be uppercase')
      .custom(async (value, { req }) => {
        const team = await Team.findOne({ teamId: value, _id: { $ne: req.params.id } });
        if (team) {
          throw new Error('Team ID already exists');
        }
        return true;
      })
  ]
};

// Player validation rules
const playerValidation = {
  create: [
    body('playerId')
      .trim()
      .notEmpty().withMessage('Player ID is required')
      .isUppercase().withMessage('Player ID must be uppercase')
      .custom(async (value) => {
        const player = await Player.findOne({ playerId: value });
        if (player) {
          throw new Error('Player ID already exists');
        }
        return true;
      }),
    
    body('name')
      .trim()
      .notEmpty().withMessage('Player name is required')
      .isLength({ min: 3 }).withMessage('Player name must be at least 3 characters'),
    
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail()
      .custom(async (value) => {
        const player = await Player.findOne({ email: value });
        if (player) {
          throw new Error('Email already registered');
        }
        return true;
      }),
    
    body('phone')
      .trim()
      .notEmpty().withMessage('Phone number is required')
      .matches(/^[0-9]{10}$/).withMessage('Invalid phone number format')
      .custom(async (value) => {
        const player = await Player.findOne({ phone: value });
        if (player) {
          throw new Error('Phone number already registered');
        }
        return true;
      }),
    
    body('age')
      .notEmpty().withMessage('Age is required')
      .isInt({ min: 16, max: 50 }).withMessage('Age must be between 16 and 50'),
    
    body('role')
      .notEmpty().withMessage('Role is required')
      .isIn(['batsman', 'bowler', 'allrounder', 'wicketkeeper'])
      .withMessage('Invalid role'),
    
    body('teamId')
      .optional()
      .isMongoId().withMessage('Invalid team ID'),
    
    body('battingStyle')
      .optional()
      .isIn(['right-handed', 'left-handed', null]),
    
    body('bowlingStyle')
      .optional()
      .isIn([
        'right-arm fast', 'right-arm medium', 'right-arm spin',
        'left-arm fast', 'left-arm medium', 'left-arm spin', null
      ])
  ],

  update: [
    param('id').isMongoId().withMessage('Invalid player ID'),
    
    body('email')
      .optional()
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail()
      .custom(async (value, { req }) => {
        const player = await Player.findOne({ email: value, _id: { $ne: req.params.id } });
        if (player) {
          throw new Error('Email already registered');
        }
        return true;
      }),
    
    body('phone')
      .optional()
      .matches(/^[0-9]{10}$/).withMessage('Invalid phone number format')
      .custom(async (value, { req }) => {
        const player = await Player.findOne({ phone: value, _id: { $ne: req.params.id } });
        if (player) {
          throw new Error('Phone number already registered');
        }
        return true;
      })
  ]
};

// Tournament validation rules
const tournamentValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Tournament name is required')
      .isLength({ min: 3 }).withMessage('Tournament name must be at least 3 characters')
      .custom(async (value) => {
        const tournament = await Tournament.findOne({ name: value });
        if (tournament) {
          throw new Error('Tournament name already exists');
        }
        return true;
      }),
    
    body('tournamentId')
      .trim()
      .notEmpty().withMessage('Tournament ID is required')
      .isUppercase().withMessage('Tournament ID must be uppercase')
      .custom(async (value) => {
        const tournament = await Tournament.findOne({ tournamentId: value });
        if (tournament) {
          throw new Error('Tournament ID already exists');
        }
        return true;
      }),
    
    body('startDate')
      .notEmpty().withMessage('Start date is required')
      .isISO8601().withMessage('Invalid date format')
      .custom((value) => {
        const startDate = new Date(value);
        if (startDate < new Date()) {
          throw new Error('Start date cannot be in the past');
        }
        return true;
      }),
    
    body('endDate')
      .notEmpty().withMessage('End date is required')
      .isISO8601().withMessage('Invalid date format')
      .custom((value, { req }) => {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(value);
        
        if (endDate <= startDate) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
    
    body('format')
      .optional()
      .isIn(['T20', 'ODI', 'Test', 'Custom'])
      .withMessage('Invalid format'),
    
    body('totalOvers')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Total overs must be between 1 and 50'),
    
    body('maxPlayersPerTeam')
      .optional()
      .isInt({ min: 11, max: 20 })
      .withMessage('Max players per team must be between 11 and 20')
  ]
};

// Match validation rules
const matchValidation = {
  create: [
    body('tournamentId')
      .notEmpty().withMessage('Tournament ID is required')
      .isMongoId().withMessage('Invalid tournament ID'),
    
    body('team1')
      .notEmpty().withMessage('Team 1 is required')
      .isMongoId().withMessage('Invalid team 1 ID'),
    
    body('team2')
      .notEmpty().withMessage('Team 2 is required')
      .isMongoId().withMessage('Invalid team 2 ID'),
    
    body('venue')
      .trim()
      .notEmpty().withMessage('Venue is required'),
    
    body('date')
      .notEmpty().withMessage('Match date is required')
      .isISO8601().withMessage('Invalid date format'),
    
    body('matchType')
      .optional()
      .isIn(['group', 'quarterfinal', 'semifinal', 'final', 'super-six', 'super-four'])
      .withMessage('Invalid match type')
  ],

  ball: [
    param('matchId').isMongoId().withMessage('Invalid match ID'),
    
    body('bowlerId')
      .notEmpty().withMessage('Bowler is required')
      .isMongoId().withMessage('Invalid bowler ID'),
    
    body('batsmanId')
      .notEmpty().withMessage('Batsman is required')
      .isMongoId().withMessage('Invalid batsman ID'),
    
    body('runs')
      .isInt({ min: 0, max: 6 }).withMessage('Runs must be between 0 and 6'),
    
    body('extraType')
      .optional()
      .isIn(['wide', 'no ball', 'bye', 'leg bye', 'penalty', null])
      .withMessage('Invalid extra type'),
    
    body('isWicket')
      .isBoolean().withMessage('isWicket must be boolean'),
    
    body('wicketType')
      .optional()
      .isIn(['bowled', 'caught', 'lbw', 'run out', 'stumped', 'hit wicket', null])
      .withMessage('Invalid wicket type')
  ]
};

// Query parameter validation
const queryValidation = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer')
      .toInt(),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
      .toInt()
  ],

  sort: [
    query('sortBy')
      .optional()
      .isString().withMessage('sortBy must be a string'),
    
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc']).withMessage('sortOrder must be "asc" or "desc"')
  ]
};

// File upload validation
const fileValidation = {
  image: (req, res, next) => {
    if (!req.file) {
      return next();
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: 'Only JPEG, JPG, PNG, and GIF images are allowed'
      });
    }

    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        error: 'Image size must be less than 5MB'
      });
    }

    next();
  },

  multipleImages: (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 10;

    if (req.files.length > maxFiles) {
      return res.status(400).json({
        success: false,
        error: `Maximum ${maxFiles} files allowed`
      });
    }

    for (const file of req.files) {
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: 'Only JPEG, JPG, PNG, and GIF images are allowed'
        });
      }

      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          error: 'Each image must be less than 5MB'
        });
      }
    }

    next();
  }
};

module.exports = {
  teamValidation,
  playerValidation,
  tournamentValidation,
  matchValidation,
  queryValidation,
  fileValidation
};