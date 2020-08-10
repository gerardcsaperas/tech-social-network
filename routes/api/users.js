const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { body, validationResult } = require('express-validator');

// Require user's model
const User = require('../../models/User');

// @route   POST api/users
// @desc    Register User
// @access  Public
router.post(
    '/', [
        body('username', 'Username is requiredqunit-pass').notEmpty(),
        body('password', 'Password must be 8 characters or longer').isLength({ min: 8 }),
        body('email', 'Please ener a valid email').isEmail()
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;

        try {
            // See if user already exists
            let user = await User.findOne({ email });

            if (user) {
                return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
            }
            // Get users gravatar (based on their email)
            const avatar = gravatar.url(email, {
                size: '200',
                rating: 'pg',
                default: 'monsterid'
            });
            // Create a new instance of User
            user = new User({ username, email, password, avatar });

            // Encrypt password (bcrypt)
            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt);

            // Save new user in database
            await user.save();

            // Return jsonwebtoken (in the front end, when a user registers, we want them to login right away)
            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 3600 }, (err, token) => {
                if (err) throw err;
                res.json({ token });
            });
        } catch (err) {
            console.log(err.message);
            res.status(500).send('Server error');
        }
    }
);

module.exports = router;