import { useState, useContext, useEffect } from 'react';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import PopupWithForm from './PopupWithForm';

function EditProfilePopup({ isOpen, onClose, onUpdateUser }) {
  const [inputValues, setInputValues] = useState({ name: '', about: '' });
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = useContext(CurrentUserContext);

  function handleInputChange(evt) {
    const { name, value } = evt.target;
    setInputValues({
      ...inputValues,
      [name]: value
    });
  }

  function handleSubmit(evt) {
    evt.preventDefault();
    setIsLoading(true);
    onUpdateUser(inputValues, setIsLoading);
  }

  useEffect(() => {
    setInputValues({
      name: currentUser.name,
      about: currentUser.about
    });
  }, [currentUser, isOpen]);

  return (
    <PopupWithForm
      name="edit"
      title="Редактировать профиль"
      buttonName="Сохранить"
      buttonLoadingName="Сохранение..."
      isOpen={isOpen}
      isLoading={isLoading}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <input
        className="popup__input popup__input_content_heading"
        name="name"
        type="text"
        placeholder="Имя"
        required
        minLength="2"
        maxLength="40"
        value={inputValues.name || ''}
        onChange={handleInputChange}
      />
      <span className="popup__input-error profileNameInput-error"></span>
      <input
        className="popup__input popup__input_content_option"
        name="about"
        type="text"
        placeholder="О себе"
        required
        minLength="2"
        maxLength="200"
        value={inputValues.about || ''}
        onChange={handleInputChange}
      />
      <span className="popup__input-error ocupationInput-error"></span>
    </PopupWithForm>
  );
}

export default EditProfilePopup;
