import AsyncHandler from '@/utils/AsyncHandler'
import { Request, Response, NextFunction } from 'express'
import ProvinceModel from '@/models/province'
import DistrictModel from '@/models/district'
import WardModel from '@/models/ward'

export const getProvinces = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const provinces = await ProvinceModel.find()
  res.status(200).json({
    status: 'success',
    data: provinces
  })
})
export const getDistricts = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { provinceCode } = req.params
  const province_code = Number(provinceCode)
  const districts = await DistrictModel.find({ province_code })

  res.status(200).json({
    status: 'success',
    data: districts
  })
})
export const getWards = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { districtCode } = req.params
  const district_code = Number(districtCode)
  const wards = await WardModel.find({ district_code })
  res.status(200).json({
    status: 'success',
    data: wards
  })
})
