import React, { Children, cloneElement, createContext, useContext, useState } from 'react';
import { attributesToProps, domToReact } from 'html-react-parser';

const BookingContext = createContext(null);
const emptyForm = { name: '', phone: '', service: 'Tire Service / New Tires', date: '', vehicle: '', notes: '' };

export function BookingProvider({ children }) {
  const [values, setValues] = useState(emptyForm);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(null);
  const value = { values, setValues, error, setError, success, setSuccess };
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

function bindFormFields(children, values, update) {
  return Children.map(children, (child) => {
    if (!child || typeof child !== 'object' || !child.props) return child;
    const name = child.props.name;
    const fieldProps = name && Object.hasOwn(values, name)
      ? { value: values[name], onChange: (event) => update(name, event.target.value) }
      : {};
    const nested = child.props.children ? bindFormFields(child.props.children, values, update) : child.props.children;
    return cloneElement(child, fieldProps, nested);
  });
}

export function replaceBookingNode(node) {
  if (node.attribs?.id === 'bookForm') return <BookingForm node={node} />;
  if (node.attribs?.id === 'bookSuccess') return <BookingSuccess node={node} />;
  if (node.attribs?.id === 'bookError') return <BookingError node={node} />;
  if (node.attribs?.id === 'bookNameOut') return <BookingName node={node} />;
  if (node.attribs?.id === 'bookServiceOut') return <BookingService node={node} />;
  return undefined;
}

function BookingForm({ node }) {
  const { values, setValues, error, setError, success, setSuccess } = useContext(BookingContext);
  const update = (name, value) => setValues((current) => ({ ...current, [name]: value }));
  const props = attributesToProps(node.attribs);
  const children = domToReact(node.children, { replace: replaceBookingNode });
  const onSubmit = (event) => {
    event.preventDefault();
    if (!values.name.trim() || !values.phone.trim()) { setError(true); return; }
    setError(false);
    setSuccess({ name: values.name.trim().split(/\s+/)[0] || 'there', service: (values.service || '').toLowerCase() });
  };
  return <form {...props} hidden={!!success} onSubmit={onSubmit}>
    {bindFormFields(children, values, update)}
  </form>;
}

function BookingError({ node }) {
  const { error } = useContext(BookingContext);
  return <div {...attributesToProps(node.attribs)} hidden={!error}>{domToReact(node.children)}</div>;
}

function BookingSuccess({ node }) {
  const { success, setSuccess, setValues, setError } = useContext(BookingContext);
  const children = domToReact(node.children, { replace: replaceBookingNode });
  const reset = () => { setValues(emptyForm); setError(false); setSuccess(null); };
  return <div {...attributesToProps(node.attribs)} hidden={!success}>
    {bindBookingChildren(children, success, reset)}
  </div>;
}

function bindBookingChildren(children, success, reset) {
  return Children.map(children, (child) => {
    if (!child || typeof child !== 'object' || !child.props) return child;
    if (child.props.id === 'bookReset') return cloneElement(child, { onClick: reset });
    return cloneElement(child, {}, child.props.children ? bindBookingChildren(child.props.children, success, reset) : child.props.children);
  });
}

function BookingName({ node }) {
  const { success } = useContext(BookingContext);
  return <span {...attributesToProps(node.attribs)}>{success?.name || 'there'}</span>;
}

function BookingService({ node }) {
  const { success } = useContext(BookingContext);
  return <span {...attributesToProps(node.attribs)}>{success?.service || 'appointment'}</span>;
}
