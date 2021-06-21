const express = require('express');
const bcrypt = require('bcrypt');
const con = require("../../database/db");
const { body, validationResult } = require('express-validator');
const router = express.Router();
const saltRounds = 10;


router.get('/', function (req, res) {
  res.render('admin_registration');
});


router.post('/', [

  //Form Validation
  body('adminname')
    .not().isEmpty()
    .withMessage('Please enter a name'),

  body('email')
    .isEmail()
    .withMessage('Invalid email'),

  body('password')
    .isLength({ min: 5 })
    .withMessage('Password must be at least 5 characters long'),

  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  })

],

  //Callback for handling post req
  function (req, res) {


    const errors = validationResult(req);

    if (!errors.isEmpty()) {


      const alert = errors.array()
      res.render('admin_registration', { alert })

    }
    else {

      let adminname = req.body.adminname;
      let email = req.body.email;
      let password = req.body.password;
      console.log("Password is " + password);

      bcrypt.hash(password, saltRounds, function (err, hash) {
        // Store hash in your password DB.
        con.on('error', function (err) {
          console.log("[mysql error]", err);
        });

        con.query(`INSERT INTO admin_registration(admin_name, admin_email, admin_password) VALUES ('${adminname}', '${email}', '${hash}');commit;`, function (err, result) {
          if (err) throw err;
          console.log("values inserted");
          res.render('admin_registration', { msg: 'Successfully registered' });
        });

      });


    }
  });
module.exports = router;