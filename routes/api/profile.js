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

//GET all profiles
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//GET a profile by the user_id
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);

        if(!profile) return res.status(400).json({ msg: 'There is no profile for this id' });
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectID'){
            return res.status(400).json({ msg: 'There is no profile for this id' });
        }
        res.status(500).send('Server error');
    }
});

//DELETE a profile, user and posts
router.delete('/', auth, async (req, res) => {
    try {
        await Profile.findOneAndRemove({ user: req.user.id });
        await User.findOneAndRemove({ _id: req.user.id });
        res.json({ msg: 'User deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//PUT a experience in profile
router.put('/experience', [ auth, [ 
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From is required').not().isEmpty()
 ] ], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    const {
        title, company, location, from, to, atual, descricao
    } = req.body;

    const newExp = {
        title, company, location, from, to, atual, descricao
    };

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//DELETE a experience by the exp_id
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        profile.experience.splice(removeIndex, 1);
        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//PUT a education in profile
router.put('/education', [ auth, [ 
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('area', 'Area is required').not().isEmpty(),
    check('from', 'From is required').not().isEmpty()
 ] ], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    const {
        school, degree, area, from, to, atual, descricao
    } = req.body;

    const newEdu = {
        school, degree, area, from, to, atual, descricao
    };

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//DELETE a education by the edu_id
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
        profile.education.splice(removeIndex, 1);
        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
module.exports = router;