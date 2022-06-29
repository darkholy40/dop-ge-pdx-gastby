import React from "react"
import PropTypes from "prop-types"
import NumberFormat from "react-number-format"
// import { IMaskInput } from "react-imask"

const PhoneNumber = React.forwardRef((props, ref) => {
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
      allowLeadingZeros
      allowNegative={false}
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

Currency.propTypes = {
  id: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

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
      allowNegative={false}
    />
  )
})

Integer.propTypes = {
  id: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

export { PhoneNumber, Currency, Percent, Integer }
