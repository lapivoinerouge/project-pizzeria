import {templates} from '../settings.js';
import utils from '../utils.js';

class Home {
  constructor(element) {
    const thisHome = this;

    thisHome.getElements(element);
    thisHome.render();
  }

  getElements(element) {
    const thisHome = this;

    thisHome.dom = {};
    thisHome.dom.wrapper = element;
  }

  render() {
    const thisHome = this;

    const generatedHtml = templates.homePage();
    const generatedDOM = utils.createDOMFromHTML(generatedHtml);
    thisHome.dom.wrapper.appendChild(generatedDOM);

    thisHome.dom.services = document.querySelector('#services-container');
  }
}

export default Home;
