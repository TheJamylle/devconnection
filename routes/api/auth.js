const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

//GET api/auth
router.get('/', auth, async (req, res) => {
    try {
        const user = await (await User.findById(req.user.id).select('-password'));
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//POST api/users
router.post('/',[
    check('email', 'Email é requerido').isEmail(),
    check('password', 'Insira a senha').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try{
        let user = await User.findOne({ email });

        if(!user) {
            return res.status(400).json({ errors: [{ msg: 'Credenciais inválidas' }] });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'Credenciais inválidas' }] });

        }
        const payload = {
            user: {
                id: user.id
            }
        }
        jwt.sign(
            payload, 
            config.get('jwtToken'), 
            { expiresIn: 360000 }, 
            (err, token) => {
                if(err) throw err;
                res.json({ token })
            }
        );

    } catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;