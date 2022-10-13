import {settings, select} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.dom.input.value = thisWidget.correctValue;
    thisWidget.initActions();
  }

  getElements() {
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  parseValue(value) {
    return parseInt(value);
  }

  isValid(value) {
    const minVal = settings.amountWidget.defaultMin,
      maxVal = settings.amountWidget.defaultMax;

    return !isNaN(value) && value >= minVal && value <= maxVal;
  }

  renderValue() {
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function() {
      thisWidget.value = thisWidget.dom.input.value;
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function() {
      thisWidget.value = thisWidget.correctValue - 1;
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function() {
      thisWidget.value = thisWidget.correctValue + 1;
    });
  }
}

export default AmountWidget;
