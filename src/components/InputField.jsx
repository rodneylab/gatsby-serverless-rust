import { ErrorMessage, Field, useField } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';
import { isBrowser } from '../utilities/utilities';
import { container, errorText, field, labelFieldContainer } from './InputField.module.scss';

const TextInputField = ({
  className,
  id,
  innerRef,
  isRequired,
  label,
  onChange,
  name,
  placeholder,
  step,
  type,
  value,
}) => {
  const [, meta] = useField(id, name, placeholder, type);

  return (
    <div className={container}>
      <div className={labelFieldContainer}>
        <label htmlFor={id}>{label}</label>
        <Field
          as="input"
          id={id}
          aria-invalid={meta.error && meta.touched ? 'true' : null}
          aria-describedby={meta.error && meta.touched ? `${id}-error` : null}
          aria-required={isRequired ? true : null}
          className={`${className} ${field}`}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          step={step}
          type={type}
          value={value}
          innerRef={innerRef}
        />
      </div>
      <small className={errorText}>
        <ErrorMessage id={`${id}-error`} name={name} />
      </small>
    </div>
  );
};

TextInputField.defaultProps = {
  className: '',
  innerRef: null,
  isRequired: null,
  onChange: null,
  step: '1',
  value: '',
};

TextInputField.propTypes = {
  innerRef: isBrowser
    ? PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
      ])
    : PropTypes.func,
  className: PropTypes.string,
  id: PropTypes.string.isRequired,
  isRequired: PropTypes.bool,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  placeholder: PropTypes.string.isRequired,
  step: PropTypes.string,
  type: PropTypes.string.isRequired,
  value: PropTypes.string,
};

export { TextInputField as default };
