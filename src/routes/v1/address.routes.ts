import { getDistricts, getProvinces, getWards } from '@/controllers/address.controller'
import express from 'express'
const Router = express.Router()

Router.get('/getProvinces', getProvinces)
Router.get('/getDistricts/:provinceCode', getDistricts)
Router.get('/getWards/:districtCode', getWards)
export default Router
