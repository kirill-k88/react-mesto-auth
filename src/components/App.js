import { useEffect, useState } from 'react';
import Header from './Header.js';
import Main from './Main.js';
import Footer from './Footer.js';
import ImagePopup from './ImagePopup.js';
import { CurrentUserContext } from '../contexts/CurrentUserContext.js';
import { api } from '../utils/Api.js';
import EditProfilePopup from './EditProfilePopup.js';
import EditAvatarPopup from './EditAvatarPopup.js';
import AddPlacePopup from './AddPlacePopup.js';
import ConfirmPopup from './ConfirmPopup.js';
import { Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import Register from './Register.js';
import Login from './Login.js';
import ProtectedRoute from './ProtectedRoute.js';
import InfoTooltip from './InfoTooltip.js';

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false);
  const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);
  const [confirmFunction, setConfirmFunction] = useState(() => {});
  const [selectedCard, setSelectedCard] = useState({});
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isRegisterSuccess, setIsRegisterSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const navigate = useNavigate();

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleCardClick(card) {
    setSelectedCard(card);
  }

  function handleCardDeleteClick(card) {
    setConfirmFunction(() => setIsLoading => {
      handleCardDelete(card, setIsLoading);
    });
    setIsConfirmPopupOpen(true);
  }

  function handleCardDelete(card, setIsLoading) {
    api
      .deleteCard(card._id)
      .then(({ message }) => {
        if (message === 'Пост удалён') {
          setCards(cards.filter(item => item._id !== card._id));
          closeAllPopups();
        }
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some(item => item._id === currentUser._id);

    (!isLiked ? api.sendLike(card._id) : api.deleteLike(card._id)).then(newCard => {
      setCards(cards => cards.map(item => (item._id === card._id ? newCard : item)));
    });
  }

  function handleUpdateUser(userObject, setIsLoading) {
    api
      .modifyUserInfo(userObject)
      .then(result => {
        setCurrentUser(result);
        closeAllPopups();
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleUpdateAvatar(avatarObject, setIsLoading) {
    api
      .modifyAvatar(avatarObject)
      .then(result => {
        setCurrentUser(result);
        closeAllPopups();
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleAddPlaceSubmit(cardObject, setInputValues, setIsLoading) {
    api
      .sendNewCard(cardObject)
      .then(result => {
        setCards([result, ...cards]);
        setInputValues({ name: '', link: '' });
        closeAllPopups();
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const baseURL = 'https://auth.nomoreparties.co';

  function handleRegister({ password, email }, setIsLoading) {
    return fetch(`${baseURL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, email })
    })
      .then(res => {
        if (!res.ok) {
          return Promise.reject(res.status);
        }
        return res.json();
      })
      .then(() => {
        navigate('/sing-in');
        setIsRegisterSuccess(true);
        setIsInfoTooltipOpen(true);
      })
      .catch(err => {
        console.log(err);
        setIsRegisterSuccess(false);
        setIsInfoTooltipOpen(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleLogin({ password, email }, setIsLoading) {
    return fetch(`${baseURL}/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, email })
    })
      .then(res => {
        if (!res.ok) {
          return Promise.reject(res.status);
        }
        return res.json();
      })
      .then(data => {
        setLoggedIn(true);
        localStorage.setItem('token', data.token);
        return checkToken();
      })
      .then(checkAnswer => {
        setEmail(checkAnswer.data.email);
        navigate('/');
      })
      .catch(err => {
        console.log(err);
        setIsRegisterSuccess(false);
        setIsInfoTooltipOpen(true);
        setIsLoading(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function checkToken() {
    return fetch(`${baseURL}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }).then(res => {
      if (!res.ok) {
        localStorage.removeItem('token');
        return Promise.reject(res.status);
      }
      return res.json();
    });
  }

  function handleLogout() {
    setLoggedIn(false);
    localStorage.removeItem('token');
    setEmail('');
    navigate('/sing-in');
  }

  function closeAllPopups() {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsConfirmPopupOpen(false);
    setIsInfoTooltipOpen(false);
    setSelectedCard({});
  }

  useEffect(() => {
    if (localStorage.getItem('token')) {
      checkToken()
        .then(checkAnswer => {
          setEmail(checkAnswer.data.email);
          setLoggedIn(true);
          navigate('/');
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      navigate('/sing-in');
    }
  }, []);

  useEffect(() => {
    Promise.all([api.getUserInfo(), api.getInitialCards()])
      .then(results => {
        setCurrentUser({
          name: results[0].name,
          about: results[0].about,
          avatar: results[0].avatar,
          _id: results[0]._id
        });
        return Promise.resolve(results[1]);
      })
      .then(initialCards => {
        setCards(initialCards);
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="root">
        <Header email={email} loggedIn={loggedIn} onLogout={handleLogout} />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute
                element={
                  <Main
                    cards={cards}
                    onEditProfile={handleEditProfileClick}
                    onAddPlace={handleAddPlaceClick}
                    onEditAvatar={handleEditAvatarClick}
                    onCardClick={handleCardClick}
                    onCardLike={handleCardLike}
                    onCardDeleteClick={handleCardDeleteClick}
                  />
                }
                loggedIn={loggedIn}
              />
            }
          />
          <Route path="/sing-up" element={<Register onRegister={handleRegister} />} />
          <Route path="/sing-in" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/sing-in" replace />} />
        </Routes>
        <EditProfilePopup
          isOpen={isEditProfilePopupOpen}
          onClose={closeAllPopups}
          onUpdateUser={handleUpdateUser}
        />
        <EditAvatarPopup
          isOpen={isEditAvatarPopupOpen}
          onClose={closeAllPopups}
          onUpdateAvatar={handleUpdateAvatar}
        />
        <AddPlacePopup
          isOpen={isAddPlacePopupOpen}
          onClose={closeAllPopups}
          onAddPlace={handleAddPlaceSubmit}
        />
        <ConfirmPopup
          isOpen={isConfirmPopupOpen}
          onClose={closeAllPopups}
          onConfirm={confirmFunction}
        />
        <InfoTooltip
          isOpen={isInfoTooltipOpen}
          isRegisterSuccess={isRegisterSuccess}
          onClose={closeAllPopups}
        />
        <ImagePopup card={selectedCard} onClose={closeAllPopups} />
        <Footer />
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
