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

//GET api/profile/me
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

//POST api/profile
router.post('/', [ auth, [
    check('status', 'Status é obrigatório').not().isEmpty(),
    check('skills', 'Habilidades é obrigatório').not().isEmpty()
] ], 
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        company, website, status, bio, skills, githubusername, twitter, linkedin, facebook, instagram
    } = req.body;

    //Building profile
    const profileFields = {};
    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(status) profileFields.status = status;
    if(bio) profileFields.bio = bio;
    if(githubusername) profileFields.githubusername = githubusername;

    if(skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    };

    profileFields.social = {};
    if(twitter) profileFields.social.twitter = twitter;
    if(linkedin) profileFields.social.linkedin = linkedin;
    if(facebook) profileFields.social.facebook = facebook;
    if(instagram) profileFields.social.instagram = instagram;

    try {
        let profile = await Profile.findOne({ user: req.user.id });
        if(profile) {
            //Update profile
            profile = Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });
            res.json(profile);
        }
        //Create
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;