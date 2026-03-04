import express from 'express'

import {
  addToHistory,
  clearSearchHistory,
  getAllUsers,
  getFriendsList,
  getSearchHistory,
  getSuggestions,
  removeFromHistory,
  searchUsers
} from '@/controllers/user.controller'
import { getUserById } from '@/controllers/user.controller'
import { getUserByEmail } from '@/controllers/user.controller'
import { getUserByUserName } from '@/controllers/user.controller'
import { createUser } from '@/controllers/user.controller'
import { deleteUserById } from '@/controllers/user.controller'
import { updateUserById } from '@/controllers/user.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import {
  SignIn,
  SignUp,
  Logout,
  UpdatePassword,
  UpdateProfile,
  GetProfile,
  CheckAuth,
  UploadImage,
  SaveImage
} from '@/controllers/auth.controller'
const router = express.Router()

router.post('/sign-in', SignIn)
router.post('/sign-up', SignUp)
router.get('/checkAuth', CheckAuth)
router.post('/logout', authMiddleware, Logout)
router.get('/profile', authMiddleware, GetProfile)
router.get('/getAllUsers', getAllUsers)
router.get('/getUserById/:id', getUserById)
router.get('/getUserByEmail/:email', getUserByEmail)
router.get('/getUserByUserName/:userName', getUserByUserName)
router.get('/getSuggestion', authMiddleware, getSuggestions)
router.get('/getFriendsList', authMiddleware, getFriendsList)
router.get('/searchUsers', authMiddleware, searchUsers)
router.get('/getHistory', authMiddleware, getSearchHistory)
router.post('/register', createUser)
router.post('/addToHistory', authMiddleware, addToHistory)
router.put('/update-password', authMiddleware, UpdatePassword)
router.put('/update-profile', authMiddleware, UploadImage, SaveImage, UpdateProfile)
router.put('/updateUserById/:id', updateUserById)
router.delete('/deleteUserById/:id', deleteUserById)
router.delete('/removeHistory/:id', authMiddleware, removeFromHistory)
router.delete('/clearAllHistory', authMiddleware, clearSearchHistory)
export default router
