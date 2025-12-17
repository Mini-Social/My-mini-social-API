import express from 'express'
import { testFunction } from '../controllers/user.controller'
const router = express.Router()

router.get('/', testFunction)
export default router
