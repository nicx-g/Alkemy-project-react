import React from 'react';
import axios from 'axios';
import * as yup from 'yup';
import { useFormik } from 'formik';
import CKEditor from 'ckeditor4-react';
import { convertBase64 } from '../Utils/ConvertBase64';
import Alert from '../Utils/Alert';
import '../FormStyles.css';
const path = process.env.REACT_APP_TESTIMONIALS_ENDPOINT;

const TestimonialForm = ({ testimonial }) => {
  const initialValues = {
    name: testimonial ? testimonial.name : '',
    image: testimonial ? testimonial.image : '',
    description: testimonial ? testimonial.description : '',
  };

  const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png'];

  const formSchema = yup.object().shape({
    name: yup.string().required('El titulo es obligatorio'),
    description: yup.string().required('La descripcion es obligatoria'),
    image: yup
      .mixed()
      .required('Debe seleccionar una imagen')
      .test(
        'fileFormat',
        'Solo se permite los siguientes formatos: jpg, jpeg o png',
        (value) => value && value && SUPPORTED_FORMATS.includes(value.type),
      ),
  });

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: formSchema,
    onSubmit: (values) => {
      {
        testimonial ? editTestimonial(values) : createTestimonial(values);
      }
    },
  });

  const handleImageChange = (e) => {
    formik.setFieldValue('image', e.target.files[0]);
  };

  const handleEditorChange = (e) => {
    formik.setFieldValue('description', e.editor.getData());
  };

  const createTestimonial = async (values) => {
    try {
      const image = await convertBase64(values.image);
      const newTestimony = {
        name: values.name,
        description: values.description,
        image: image,
        required: false,
        schema: {
          $ref: '#/definitions/Testimonial',
        },
      };
      const resp = await axios.post('http://ongapi.alkemy.org/api' + path, newTestimony);
      Alert(
        'success',
        'Operación completada con éxito',
        `El testimonio ${newTestimony.name} fue creado correctamente`,
      );
    } catch (err) {
      Alert(
        'error',
        'Ocurrió un error',
        'Por favor, comprueba tu conexión a internet o vuélvelo a intentar más tarde',
      );
    }
  };

  const editTestimonial = async (values) => {
    try {
      const image = await convertBase64(values.image);
      const editedTestimony = {
        name: values.name,
        description: values.description,
        image: image,
        required: false,
        schema: {
          $ref: '#/definitions/Testimonial',
        },
      };
      const resp = await axios.put(
        `http://ongapi.alkemy.org/api${path}/${testimonial.id}`,
        editedTestimony,
      );
      Alert(
        'success',
        'Operación completada con éxito',
        `El testimonio ${editedTestimony.name} fue editado correctamente`,
      );
    } catch (err) {
      Alert(
        'error',
        'Ocurrió un error',
        'Por favor, comprueba tu conexión a internet o vuélvelo a intentar más tarde',
      );
    }
  };

  return (
    <form className="form-container" onSubmit={formik.handleSubmit}>
      <input
        className="input-field"
        id="name"
        name="name"
        placeholder="Nombre y apellido"
        type="text"
        value={formik.values.name}
        onChange={formik.handleChange}
      />

      {formik.touched.name && formik.errors.name ? <div>{formik.errors.name}</div> : null}

      <input
        accept="image/jpg, image/jpeg, image/png"
        className="input-field"
        id="image"
        name="image"
        title="Seleccionar archivo"
        type="file"
        onChange={(e) => handleImageChange(e)}
      />

      {formik.touched.image && formik.errors.image ? <div>{formik.errors.image}</div> : null}

      <CKEditor
        id="description"
        initData={formik.values.description}
        name="description"
        onChange={(e) => handleEditorChange(e)}
      />

      {formik.touched.description && formik.errors.description ? (
        <div>{formik.errors.description}</div>
      ) : null}

      <button className="submit-btn" type="submit">
        {testimonial ? 'Editar' : 'Crear'}
      </button>
    </form>
  );
};

export default TestimonialForm;
