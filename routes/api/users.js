const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

//POST api/users
router.post('/',[
    check('nome', 'Nome é requerido').not().isEmpty(),
    check('email', 'Email é requerido').isEmail(),
    check('password', 'Coloque uma senha de no mínimo 6 caracteres').isLength({ min: 6 })
], (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    res.send('User route');
});

module.exports = router;