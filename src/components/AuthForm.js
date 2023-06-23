import { useState } from 'react';

function AuthForm({ title, buttonName, buttonLoadingName, onSubmit }) {
  const [isLoading, setIsLoading] = useState(false);
  const [inputValues, setInputValues] = useState({ password: '', email: '' });

  function handleSubmit(evt) {
    evt.preventDefault();
    setIsLoading(true);
    onSubmit(inputValues, setIsLoading);
  }

  function handleInputChange(evt) {
    const { name, value } = evt.target;
    setInputValues({
      ...inputValues,
      [name]: value
    });
  }
  return (
    <form className={`auth__form`} name={`register-form`} onSubmit={handleSubmit}>
      <h2 className="auth__title">{title}</h2>
      <input
        className="auth__input"
        name="email"
        placeholder="Email"
        required
        type="email"
        value={inputValues.email || ''}
        onChange={handleInputChange}
      />
      <input
        className="auth__input auth__input_content_password"
        name="password"
        type="password"
        placeholder="Пароль"
        required
        minLength="7"
        maxLength="30"
        value={inputValues.password || ''}
        onChange={handleInputChange}
      />
      <button className="auth__button-submit common-link" type="submit">
        {!isLoading ? buttonName : buttonLoadingName}
      </button>
    </form>
  );
}

export default AuthForm;
