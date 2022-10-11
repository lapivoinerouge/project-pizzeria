import {templates, select, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

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

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct()
      }
    });

    thisProduct.element.dispatchEvent(event);
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

export default Product;
