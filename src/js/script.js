/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },

    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },

    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },

    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },

    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },

    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },

    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },

    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },

    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }

    renderInMenu() {
      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHtml = templates.menuProduct(thisProduct.data);

      /* create elemnent using utils.createDOMfromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHtml);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElements() {
      const thisProduct = this;
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);

      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion() {
      const thisProduct = this;

      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct && thisProduct.element != activeProduct) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }

    initOrderForm() {
      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function(event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function() {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event) {
        event.preventDefault();
        thisProduct.addToCart();
        thisProduct.processOrder();
      });
    }

    processOrder() {
      const thisProduct = this;
      let price = thisProduct.data.price;

      const formData = utils.serializeFormToObject(thisProduct.form);

      for (let param in thisProduct.data.params) {
        for (let option in thisProduct.data.params[param].options) {
          const isDefault = !!thisProduct.data.params[param].options[option].default;
          const isSelected = formData[param] && formData[param].includes(option);
          const optionPrice = thisProduct.data.params[param].options[option].price;
          const image = thisProduct.imageWrapper.querySelector('.' + param + '-' + option);

          if (isSelected) {
            if (!isDefault) {
              price += optionPrice;
            }
            if (image) {
              image.classList.add(classNames.menuProduct.imageVisible);
            }
          } else {
            if (isDefault) {
              price -= optionPrice;
            }
            if (image) {
              image.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }
      thisProduct.priceSingle = price;
      price *= thisProduct.amountWidget.value;
      thisProduct.price = price;
      thisProduct.priceElem.innerHTML = price;
    }

    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function() {
        thisProduct.processOrder();
      });
    }

    addToCart() {
      const thisProduct = this;
      app.cart.add(thisProduct.prepareCartProduct());
    }

    prepareCartProduct() {
      const thisProduct = this;
      const productSummary = {
        params: {}
      };
      productSummary.id = thisProduct.id;
      productSummary.name = thisProduct.data.name;
      productSummary.amount = thisProduct.amountWidget.value;
      productSummary.price = thisProduct.price;
      productSummary.priceSingle = thisProduct.priceSingle;
      productSummary.params = thisProduct.prepareCartProductParams();
      return productSummary;
    }

    prepareCartProductParams() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      const cartProductParams = {};

      for (let param in thisProduct.data.params) {
        const thisParam = thisProduct.data.params[param];
        cartProductParams[param] = {
          label: thisParam.label,
          options: {}
        };
        for (let option in thisProduct.data.params[param].options) {
          const thisOption = thisParam.options[option];
          const isSelected = formData[param] && formData[param].includes(option);

          if (isSelected) {
            cartProductParams[param].options[option] = thisOption.label;
          }
        }
      }
      return cartProductParams;
    }
  }

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
    }

    getElements(element) {
      const thisWidget = this;
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value);
      const minVal = settings.amountWidget.defaultMin;
      const maxVal = settings.amountWidget.defaultMax;

      /* TODO: add validation */
      if (!isNaN(newValue) && thisWidget.value !== newValue && newValue >= minVal && newValue <= maxVal) {
        thisWidget.value = newValue;
        thisWidget.announce();
      }
      thisWidget.input.value = thisWidget.value;
    }

    initActions() {
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function() {
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function() {
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function() {
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    announce() {
      const thisWidget = this;

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart {
    constructor(element) {
      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
    }

    getElements(element) {
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = document.querySelector(select.cart.productList);
    }

    initActions() {
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function() {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }

    add(menuProduct) {
      const thisCart = this;

      const generatedHtml = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHtml);
      thisCart.dom.productList.appendChild(generatedDOM);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      console.log(thisCart.products);
    }
  }

  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.params = menuProduct.params;
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      console.log('thiscartprod', thisCartProduct);
    }

    getElements(element) {
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget() {
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function() {
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }
  }

  const app = {
    initMenu: function() {
      const thisApp = this;

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function() {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    initCart: function() {
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function() {
      const thisApp = this;

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
