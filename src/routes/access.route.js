const express = require('express');
const accessController = require('../controllers/access.controller');
const router = express.Router();
 
const {asyncHandler} = require('../helpers/asyncHandler');
const { authentication } = require('../auth/authUtil');

router.post('/shop/signup', asyncHandler(accessController.signUp))
router.post('/shop/login', asyncHandler(accessController.login))


//authentication
router.use(authentication)

//logout
router.post('/shop/logout', asyncHandler(accessController.logout))
router.post('/shop/handleRefreshToken', asyncHandler(accessController.handleRefreshToken))



module.exports = router