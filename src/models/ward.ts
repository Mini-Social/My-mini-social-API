import mongoose from 'mongoose'

interface IWard extends mongoose.Document {
  name: string
  code: number
  codename: string
  division_type: string
  short_codename: string
  district_code: number
}

const WardSchema = new mongoose.Schema<IWard>({
  name: String,
  code: Number,
  codename: String,
  division_type: String,
  short_codename: String,
  district_code: Number
})
const WardModel = mongoose.model('Ward', WardSchema, 'Ward')
export default WardModel
