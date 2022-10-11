import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {
  initMenu: function() {
    const thisApp = this;

    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function() {
    const thisApp = this;
    const url = settings.db.url + '/' + settings.db.products;

    thisApp.data = {};

    fetch(url)
      .then((rawResponse) => {
        return rawResponse.json();
      })
      .then((parsedResponse) => {
        /* save parsedResponse at thisApp.data.products */
        thisApp.data.products = parsedResponse;

        /* execute initMenu method */
        thisApp.initMenu();
      });
  },

  initCart: function() {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);
    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function() {
      thisApp.cart.add(event.detail.product);
    });
  },

  initPages: function() {
    const thisApp = this;

    /* get container with pages */
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    /* nav links */
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    /* get id of first page */
    // thisApp.activatePage(thisApp.pages[0].id);

    /* code below won't work when we type what doesn't exist in url */
    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    /* add event listeners to links */
    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function() {
        const clickedElement = this;
        event.preventDefault();

        /* get id from attribute href - replace # with empty string */
        const id = clickedElement.getAttribute('href').replace('#', '');

        /* run thisApp.activatePage with this id */
        thisApp.activatePage(id);

        /* change URL hash - the end of page address */
        /* slash is after # prevents scrolling page up when changed URL hash */
        window.location.hash = '#/' + id;
      });
    }

  },

  activatePage: function(pageId) {
    const thisApp = this;

    /* add class active to matching pages and remove from non-matching */
    for (let page of thisApp.pages) {
      /* to not repeat code - we can use toggle with second arg - conditon */
      page.classList.toggle(
        classNames.pages.active,
        page.id == pageId);
    }

    /* add class active to matching links and remove from non-matching */
    for (let link of thisApp.navLinks) {
      /* to not repeat code - we can use toggle with second arg - conditon */
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  },

  initBooking: function() {
    const thisApp = this;
    const bookingWrapper = document.querySelector(select.containerOf.booking);

    thisApp.booking = new Booking(bookingWrapper);
  },

  init: function() {
    const thisApp = this;

    thisApp.initData();
    thisApp.initCart();
    thisApp.initPages();
    thisApp.initBooking();
  },
};

app.init();

