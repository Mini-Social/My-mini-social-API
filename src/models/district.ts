import mongoose from 'mongoose'

interface IDistrict extends mongoose.Document {
  name: string
  code: number
  codename: string
  division_type: string
  short_codename: string
  province_code: number
}

const DistrictSchema = new mongoose.Schema<IDistrict>({
  name: String,
  code: Number,
  codename: String,
  division_type: String,
  short_codename: String,
  province_code: Number
})
const DistrictModel = mongoose.model('District', DistrictSchema, 'District')
export default DistrictModel
