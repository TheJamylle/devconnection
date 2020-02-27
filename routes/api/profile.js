const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');

const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Profile = require('../../models/Profile');

//GET api/profile
router.get('/me', auth, async (req, res) => {
 try {
     const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);
     if(!profile) {
         return res.status(400).json({ msg: 'Não existe perfil para esse usuário.' });
     }
     res.json(profile);
 } catch (err) {
     console.error(err.message);
     res.status(500).send('Server error');
 }
});

module.exports = router;