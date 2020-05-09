'use strict';

const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const buttonAuth = document.querySelector('.button-auth');
const closeAuth = document.querySelector('.close-auth');
const modalAuth = document.querySelector('.modal-auth');
const loginForm = document.querySelector('#logInForm');
const loginInput = document.querySelector('#login');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');
const cardsRestaurants = document.querySelector('.cards-restaurants');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const menu = document.querySelector('.menu');
const logo = document.querySelector('.logo');
const cardsMenu = document.querySelector('.cards-menu');
const modalBody = document.querySelector('.modal-body');
const modalPrice = document.querySelector('.modal-pricetag');
const buttonClearCart = document.querySelector('.clear-cart');
const cartNotEmpty = document.querySelector('.button-cart-not-empty');

let login = localStorage.getItem('user');

const cart = [];

const getData = async function(url) {

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`ошибка по адресу ${url}, статус ошибка ${response.status}!`)
  }

  return response.json();

}

const valid = function(str) {
  const nameReg = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/;
  return nameReg.test(str);
}

const toggleModal = function () {
  modal.classList.toggle("is-open");
}

const toggleModalAuth = function () {
  modalAuth.classList.toggle('is-open');
  loginInput.style.borderColor = '';
}


const autorized = function () {
  console.log('авторизован');

  function logOut() {
    login = null;
    buttonAuth.style.display = '';
    userName.style.display = '';
    buttonOut.style.display = '';
    cartButton.style.display = '';

    localStorage.removeItem('user');
    cart.length = 0;
    
    buttonOut.removeEventListener('click', logOut);
    checkAuth();
  }
  
  userName.textContent = login;
  
  buttonAuth.style.display = 'none';
  userName.style.display = 'inline';
  buttonOut.style.display = 'flex';
  cartButton.style.display = 'flex';

  buttonOut.addEventListener('click', logOut);
}

const notAutorized = function () {
  console.log('не авторизован');

  function logIn(e) {
    e.preventDefault();
    
    if(loginInput.value) {
      loginInput.style.borderColor = '';
      login = loginInput.value;
  
      localStorage.setItem('user', login);
  
      toggleModalAuth();
  
      buttonAuth.removeEventListener('click', toggleModalAuth);
      closeAuth.removeEventListener('click', toggleModalAuth);
      loginForm.removeEventListener('submit', logIn);
      loginForm.reset();
      checkAuth();
    }
    else {
      loginInput.style.borderColor = 'red';
    }
  }

  buttonAuth.addEventListener('click', toggleModalAuth);
  closeAuth.addEventListener('click', toggleModalAuth);
  loginForm.addEventListener('submit', logIn);
}

const checkAuth = function () {
  if(login) {
    autorized();
  } else {
    notAutorized();
    buttonAuth.style.display = '';
  }
} 
  
const createCardRestorans = function ({ 
    image,
    kitchen, 
    price, 
    stars, 
    products, 
    name, 
    time_of_delivery: timeOfDelivery 
  }) {
  
  const card1 = `
  <a class="card card-restaurant" data-products="${products}">
    <img src="${image}" alt="image" class="card-image"/>
    <div class="card-text">
      <div class="card-heading">
        <h3 class="card-title">${name}</h3>
        <span class="card-tag tag">${timeOfDelivery}</span>
      </div>
      <div class="card-info">
        <div class="rating">
          ${stars}
        </div>
        <div class="price">От ${price} ₽</div>
        <div class="category">${kitchen}</div>
      </div>
    </div>
  </a>
  `;

  cardsRestaurants.insertAdjacentHTML('beforeend', card1);
} 

const createCardGood = function ({ id, image, description, price, name }) {

  const card = document.createElement('div');
  card.className = 'card';
  card.insertAdjacentHTML('beforeend', `
    <img src="${image}" alt="image" class="card-image"/>
    <div class="card-text">
      <div class="card-heading">
        <h3 class="card-title card-title-reg">${name}</h3>
      </div>
      <div class="card-info">
        <div class="ingredients">
          ${description}
        </div>
      </div>
      <div class="card-buttons">
        <button id="${id}" class="button button-primary button-add-cart">
          <span class="button-card-text">В корзину</span>
          <span class="button-cart-svg"></span>
        </button>
        <strong class="card-price card-price-bold">${price} ₽</strong>
      </div>
    </div>
  `);

  cardsMenu.insertAdjacentElement('beforeend', card);
}

const openGoods = function (e) {
  const target = e.target;
  if(login) {

    const restaurant = target.closest('.card-restaurant');

    if(restaurant) {

      cardsMenu.textContent = '';
      containerPromo.classList.add('hide');
      restaurants.classList.add('hide');

      getData(`./db/${restaurant.dataset.products}`).then(function(data) {
        data.forEach(createCardGood);    
      });

      menu.classList.remove('hide');
      
    }       
  } else {
    toggleModalAuth();
  }

}

const addToCart = function(e) {
  const target = e.target;

  const buttonAddToCart = target.closest('.button-add-cart');

  if(buttonAddToCart) {
    const card = target.closest('.card');
    const title = card.querySelector('.card-title-reg').textContent;
    const cost = card.querySelector('.card-price').textContent;
    const id = buttonAddToCart.id;

    const food = cart.find(function(item){
      return item.id === id; 
    })

    if(food) {
      food.count++
    } else {
      cart.push({
        title,
        cost,
        id,
        count: 1
      });
    }
  }
}

const renderCart = function() {

  modalBody.textContent = '';

  cart.forEach(function({ title, cost, id, count }){
    const itemCart = `
      <div class="food-row">
        <span class="food-name">${title}</span>
        <strong class="food-price">${cost}</strong>
        <div class="food-counter">
          <button class="counter-button counter-minus" data-id=${id}>-</button>
          <span class="counter">${count}</span>
          <button class="counter-button counter-plus" data-id=${id}>+</button>
        </div>
      </div>
    `;

    modalBody.insertAdjacentHTML('afterbegin', itemCart);
  })

  const totalPrice = cart.reduce(function(result, item){
    return result + (parseFloat(item.cost) * item.count);
  }, 0);

  modalPrice.textContent = totalPrice + '₽';

}

const changeCount = function(e) {
  const target = e.target;

  if(target.classList.contains('counter-button')) {
    const food = cart.find(function(item){
      return item.id === target.dataset.id
    })
    if(target.classList.contains('counter-minus')) {
      food.count--
      if(food.count === 0) {
        cart.splice(cart.indexOf(food), 1);
        cartUnempty();
      }
    };  
    if(target.classList.contains('counter-plus')) food.count++;
    renderCart();
  }
}

const cartUnempty = function () {
  if(cart.length > 0) {
    console.log(cart.length);
    console.log('not empty');
    cartNotEmpty.style.display = 'flex';  
  } else {
    cartNotEmpty.style.display = '';      
  }
}

function init() {
  getData('./db/partners.json').then(function(data) {
    data.forEach(createCardRestorans);    
  });

  
  cartButton.addEventListener("click", function() {
    renderCart();
    toggleModal();
  });
  
  buttonClearCart.addEventListener("click", function() {
    cart.length = 0;
    cartUnempty();
    renderCart();
  });

  modalBody.addEventListener("click", changeCount);
  
  cardsMenu.addEventListener("click", addToCart);
  
  close.addEventListener("click", function() {
    cartUnempty();
    toggleModal();
  });
  
  cardsRestaurants.addEventListener('click', openGoods);
  
  logo.addEventListener('click', function() {
    containerPromo.classList.remove('hide');
    restaurants.classList.remove('hide');
    menu.classList.add('hide');
  });
  
  checkAuth();
  
  new Swiper('.swiper-container', {
    loop: true,
    slidePreview: 1,
    autoplay: true
  });
  document.addEventListener('click' , cartUnempty);
}
init();