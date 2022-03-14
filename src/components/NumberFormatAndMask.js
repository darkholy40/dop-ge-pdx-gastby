import React from "react"
import PropTypes from "prop-types"
import NumberFormat from "react-number-format"
import { IMaskInput } from "react-imask"

const PhoneNumber = React.forwardRef((props, ref) => {
  const { onChange, ...other } = props
  return (
    <IMaskInput
      {...other}
      mask="000-000-0000"
      // mask="(#00) 000-0000"
      // definitions={{
      //   '#': /[1-9]/,
      // }}
      inputRef={ref}
      onAccept={value => onChange({ target: { id: props.id, value } })}
      overwrite
    />
  )
})

PhoneNumber.propTypes = {
  id: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

const Currency = React.forwardRef((props, ref) => {
  const { onChange, ...other } = props

  return (
    <NumberFormat
      {...other}
      getInputRef={ref}
      onValueChange={values => {
        onChange({
          target: {
            id: props.id,
            value: values.value,
          },
        })
      }}
      thousandSeparator
      isNumericString
      decimalScale={2}
      // prefix="$"
    />
  )
})

const Percent = React.forwardRef((props, ref) => {
  const { onChange, ...other } = props

  return (
    <NumberFormat
      {...other}
      getInputRef={ref}
      onValueChange={values => {
        onChange({
          target: {
            id: props.id,
            value: values.value,
          },
        })
      }}
      // thousandSeparator
      isNumericString
      decimalScale={2}
      // prefix="$"
    />
  )
})

Percent.propTypes = {
  id: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

const Integer = React.forwardRef((props, ref) => {
  const { onChange, ...other } = props

  return (
    <NumberFormat
      {...other}
      getInputRef={ref}
      onValueChange={values => {
        onChange({
          target: {
            id: props.id,
            value: values.value,
          },
        })
      }}
      isNumericString
      decimalScale={0}
    />
  )
})

Integer.propTypes = {
  id: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

export { PhoneNumber, Currency, Percent, Integer }
