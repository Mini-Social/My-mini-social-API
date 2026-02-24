import mongoose from 'mongoose'

interface IProvince extends mongoose.Document {
  name: string
  code: number
  codename: string
  division_type: string
  phone_code: number
}

const ProvinceSchema = new mongoose.Schema<IProvince>({
  name: String,
  code: Number,
  codename: String,
  division_type: String,
  phone_code: Number
})
const ProvinceModel = mongoose.model('Province', ProvinceSchema, 'Province')
export default ProvinceModel
