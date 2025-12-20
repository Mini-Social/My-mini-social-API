import express from 'express'

import { getAllUsers } from '@/controllers/user.controller'
import { getUserById } from '@/controllers/user.controller'
import { getUserByEmail } from '@/controllers/user.controller'
import { getUserByUserName } from '@/controllers/user.controller'
import { createUser } from '@/controllers/user.controller'
import { deleteUserById } from '@/controllers/user.controller'
import { updateUserById } from '@/controllers/user.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { SignIn, SignUp, Logout, UpdatePassword, UpdateProfile, GetProfile } from '@/controllers/auth.controller'
const router = express.Router()

router.post('/sign-in', SignIn)
router.post('/sign-up', SignUp)
router.post('/logout', authMiddleware, Logout)
router.get('/profile', authMiddleware, GetProfile)
router.get('/getAllUsers', getAllUsers)
router.get('/getUserById/:id', getUserById)
router.get('/getUserByEmail/:email', getUserByEmail)
router.get('/getUserByUserName/:userName', getUserByUserName)
router.post('/register', createUser)
router.put('/update-password', authMiddleware, UpdatePassword)
router.put('/update-profile', authMiddleware, UpdateProfile)
router.put('/updateUserById/:id', updateUserById)
router.delete('/deleteUserById/:id', deleteUserById)
export default router
