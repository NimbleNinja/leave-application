import * as yup from 'yup'
import { getDaysDiff } from './dateUtils'

export const getValidationSchema = () => {
  const daysCount = 14

  return yup.object().shape({
    login: yup.string().required('Login is required'),
    name: yup
      .string()
      .required('Name is required')
      .test(
        'check curilic',
        'The name can only consist of Latin letters',
        value =>
          !value.split('').some(letter => {
            const charCode = letter.charCodeAt(0)
            const isUpper = charCode >= 65 && charCode <= 90
            const isLower = charCode >= 97 && charCode <= 122
            const isSpace = charCode === 32
            return !isUpper && !isLower && !isSpace
          })
      ),
    startDate: yup
      .date()
      .required('Start date is required')
      .test('min value', 'The start date cannot be past', value => {
        const diffDays = +getDaysDiff(new Date().toDateString(), value.toDateString())
        return diffDays >= 0
      }),
    endDate: yup
      .date()
      .required('End date is required')
      .min(yup.ref('startDate'), 'End date must be greater than start date')
      .test('endDateMaxValue', 'The number of days can be 1 - 14', (endDate, context) => {
        const diffDays = +getDaysDiff(context.parent.startDate, endDate.toDateString())
        return diffDays <= daysCount && diffDays > 0
      }),
    email: yup
      .string()
      .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Incorect format')
      .required('Email is required'),
    phone: yup.string().required('Phone is required')
  })
}
