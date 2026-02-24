import fs from 'fs'
import { connectToDatabase } from './config/mongodb'
import ProvinceModel from './models/province'
import DistrictModel from './models/district'
import WardModel from './models/ward'
const jsonData = fs.readFileSync('./src/data.json', 'utf-8')
const data = JSON.parse(jsonData)
interface IProvince {
  name: string
  code: number
  codename: string
  division_type: string
  phone_code: number
  districts: IDistrict[]
}
interface IDistrict {
  name: string
  code: number
  codename: string
  division_type: string
  short_codename: string
  province_code: number
  wards: IWard[]
}
interface IWard {
  name: string
  code: number
  codename: string
  division_type: string
  short_codename: string
  district_code: number
}
const provinces: Omit<IProvince, 'districts'>[] = []
const districts: Omit<IDistrict, 'wards'>[] = []
const wards: IWard[] = []

if (data) {
  data.forEach((province: IProvince) => {
    provinces.push({
      name: province.name,
      code: province.code,
      codename: province.codename,
      division_type: province.division_type,
      phone_code: province.phone_code
    })
    const district = province.districts
    district.forEach((district) => {
      districts.push({
        name: district.name,
        code: district.code,
        codename: district.codename,
        division_type: district.division_type,
        short_codename: district.short_codename,
        province_code: province.code
      })
      const ward = district.wards
      ward.forEach((ward) => {
        wards.push({
          name: ward.name,
          code: ward.code,
          codename: ward.codename,
          division_type: ward.division_type,
          short_codename: ward.short_codename,
          district_code: district.code
        })
      })
    })
  })
}

const seedData = async () => {
  try {
    await WardModel.insertMany(wards)
  } catch (error) {
    console.log(error)
  }
}
connectToDatabase().then(() => {
  seedData()
})
