import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFormik } from 'formik'
import cls from './App.module.scss'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import InputMask from 'react-input-mask'

import { getDaysDiff } from './tools/dateUtils'
import { getValidationSchema } from './tools/validation'
import { IFormValues, IResponseData } from './types/types'

export const App: React.FC = () => {
  const [isLoad, setIsLoad] = useState(false)
  const pdfRef = useRef<HTMLDivElement | null>(null)
  const [imdData, setImgData] = useState('')
  const reader = useMemo(() => new FileReader(), [])

  useEffect(() => {
    const readerHandler = () => {
      setImgData(reader.result as string)
    }

    reader.addEventListener('loadend', readerHandler)

    return () => reader.removeEventListener('loadend', readerHandler)
  }, [reader])

  const { values, handleSubmit, handleChange, setFieldValue, errors } = useFormik<IFormValues>({
    initialValues: {
      login: '',
      name: '',
      position: 'Software Developer',
      startDate: '',
      endDate: '',
      email: '',
      phone: '',
      avatar_url: ''
    },
    onSubmit: () => {
      if (pdfRef.current) {
        const doc = new jsPDF({
          unit: 'px',
          format: [814, 1123],
          putOnlyUsedFonts: true
        })
        html2canvas(pdfRef.current, { logging: true }).then(canvas => {
          const imgData = canvas.toDataURL('image/png')
          doc.addImage(imgData, 'PNG', 0, 0, 814, 500)
          doc.save('canvas.pdf')
        })
      }
    },
    validationSchema: getValidationSchema()
  })

  const getAvatarFile = useCallback(
    (url: string) => {
      fetch(url)
        .then(res => res.blob())
        .then(blob => reader.readAsDataURL(blob))
    },
    [reader]
  )

  const getUserInfoHandler = useCallback(() => {
    if (values.login) {
      setIsLoad(true)
      fetch(`https://api.github.com/users/${values.login}`)
        .then(res => res.json())
        .then(({ email, avatar_url, name }: IResponseData) => {
          if (email) {
            setFieldValue('email', email)
          }
          if (avatar_url) {
            setFieldValue('avatar_url', avatar_url)
            getAvatarFile(avatar_url)
          }
          if (name) {
            setFieldValue('name', name)
          }
        })
        .catch(err => {
          console.log(err.message)
        })
        .finally(() => {
          setIsLoad(false)
        })
    }
  }, [getAvatarFile, setFieldValue, values.login])

  return (
    <div className={cls.app}>
      {isLoad && (
        <div className={cls.loader}>
          <span />
        </div>
      )}
      <div className={cls.container}>
        <h1 className={cls.title}>Leave application</h1>

        <form className={cls.form} onSubmit={handleSubmit}>
          <div className={cls.formControl}>
            <label htmlFor="login">
              Login: {errors.login && <span className={cls.error}>{errors.login}</span>}
            </label>
            <div className={cls.formControlContent}>
              <input name="login" value={values.login} onChange={handleChange} type="text" />
              <button className={cls.button} onClick={getUserInfoHandler} type="button">
                get from github
              </button>
            </div>
          </div>

          <div className={cls.formControl}>
            <label htmlFor="name">
              Name: {errors.name && <span className={cls.error}>{errors.name}</span>}
            </label>
            <input name="name" value={values.name} onChange={handleChange} type="text" />
          </div>

          <div className={cls.formControl}>
            <label htmlFor="position">
              Position: {errors.position && <span className={cls.error}>{errors.position}</span>}
            </label>
            <select name="position" value={values.position} onChange={handleChange}>
              <option value="Software Developer">Software Developer</option>
              <option value="Project Manager">Project Manager</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="Network Engineer">Network Engineer</option>
              <option value="Software Tester">Software Tester</option>
            </select>
          </div>

          <div className={cls.formControl}>
            <label htmlFor="startDate">
              Start date:{' '}
              {errors.startDate && <span className={cls.error}>{errors.startDate}</span>}
            </label>
            <input name="startDate" value={values.startDate} onChange={handleChange} type="date" />
          </div>

          <div className={cls.formControl}>
            <label htmlFor="endDate">
              End date: {errors.endDate && <span className={cls.error}>{errors.endDate}</span>}
            </label>
            <input name="endDate" value={values.endDate} onChange={handleChange} type="date" />
          </div>

          <div className={cls.formControl}>
            <label htmlFor="email">
              Email: {errors.email && <span className={cls.error}>{errors.email}</span>}
            </label>
            <input name="email" value={values.email} onChange={handleChange} type="email" />
          </div>

          <div className={cls.formControl}>
            <label htmlFor="phone">
              Phone: {errors.phone && <span className={cls.error}>{errors.phone}</span>}
            </label>
            <InputMask
              name="phone"
              value={values.phone}
              onChange={handleChange}
              mask={'+38\\099 999 99 99'}
              maskChar={'X'}
              type="phone"
            />
          </div>

          <div className="formActions">
            <button className={cls.button} type="submit">
              save
            </button>
          </div>
        </form>

        <div className={cls.tempalteContainer}>
          <div className={cls.template} ref={pdfRef}>
            <h2 className={cls.templateTitle}>Шаблон заявки</h2>
            <div className={cls.templateHeader}>
              <div className={cls.userAvatar}>
                <img src={imdData} alt="avatar" />
                <p>{values.login}</p>
              </div>
              <div className={cls.subHeader}>
                <p>{`Директору ТОВ "Панда-Груп"`}</p>
                <p>Іванову В. М.</p>
                <p>{values.position}</p>
                <p>{values.name}</p>
              </div>
            </div>
            <div className={cls.content}>
              <h4>Заява</h4>
              <p>
                Прошу надати мені відпустку в період {values.startDate} - {values.endDate} року в
                кількості {getDaysDiff(values.startDate, values.endDate)} календарних днів.
              </p>
              <p>В період відпустки мої контакти за якими буду в доступності:</p>
              <p>Мій номер телефону: {values.phone}</p>
              <p>Моя ел. адреса: {values.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
