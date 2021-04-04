import { ContactManager } from './ContactManager.js';
import { TagManager } from './TagManager.js';

export const UI = (function() {
  const templates = {};

  return class UI {
    constructor(containerSelector = 'main') {
      this.container = document.querySelector(containerSelector);
      this.contacts = new ContactManager(this);
      this.tags = new TagManager(this);
      this.currentPage = null;
      this.currentSubPage = this.find('#contacts');
      this.loadTemplates();
      this.bindEvents();
      this.goTo('home');
    }

    bindEvents() {
      this.container.addEventListener('click', this.dispatchButtonPress);
      this.container.addEventListener('submit', this.dispatchFormSubmission);

      this.find('#query').addEventListener('input', this.handleSearch);

      this.find('#tag_controls-tag').addEventListener('change',this.handleTagFilter);
    }

    dispatchButtonPress = (event) => {
      if (event.target.tagName !== 'BUTTON') return;

      switch(event.target.dataset.type) {
        case 'ui': return this.goTo('home');
        case 'contact': return this.contacts.handleButtonPress(event);
        case 'tag': return this.tags.handleButtonPress(event);
      }
    }

    dispatchFormSubmission = (event) => {
      event.preventDefault();

      switch(event.target.dataset.type) {
        case 'contact': return this.contacts.handleFormSubmission(event);
        case 'tag': return this.tags.handleFormSubmission(event);
      }
    }

    handleSearch = (event) => {
      const query = event.target.value;
      if (query) {
        const results = this.contacts.search(query);
        this.renderContacts(results, query);
      } else {
        this.hideMessage();
        this.renderContacts(this.contacts.all());
      }
    }

    handleTagFilter = (event) => {
      const tag = event.target.value;
      if (tag) {
        const results = this.contacts.tagFilter(tag);
        this.renderContacts(results, tag);
      } else {
        this.renderContacts(this.contacts.all());
      }
    }

    loadTemplates() {
      let templateScripts = document.querySelectorAll('script[type="text/x-handlebars"]');
      Array.from(templateScripts).forEach(template => {
        templates[template.id] = Handlebars.compile(template.innerHTML);
      });
    }

    goTo(pageId) {
      const newPage = this.container.querySelector(`#${pageId}`);
      if (newPage === this.currentPage) return;

      if (this.currentPage) {
        this.hide(this.currentPage);

        const form = this.currentPage.querySelector('form');
        if (form) form.reset();
      }

      this.currentPage = newPage;
      this.show(newPage);
    }

    hide(page) {
      page.classList.add('hidden');
    }

    show(page) {
      page.classList.remove('hidden');
    }

    find(selector, root = this.container) {
      return root.querySelector(selector);
    }

    renderContact(contact) {
      this.tags.refresh(contact);
      const html = templates.contactTemplate(contact);
      this.removeContact(contact.id);
      this.find('#contacts ul').insertAdjacentHTML('beforeend', html);
    }

    renderContacts(contacts, query = '') {
      if (contacts.length > 0) {
        this.hideMessage();
        this.find('ul').textContent = null;
        contacts.forEach(this.renderContact, this);
      } else {
        this.showMessage(query);
      }
    }

    removeContact(id) {
      const contactElement = this.find(`li[data-id="${id}"`);
      if (contactElement) contactElement.remove();
    }

    renderTag(tag) {
      const html = templates.tagTemplate({ tag: tag });
      TagManager.tagContainerIds.forEach(containerId => {
        this.find(containerId).insertAdjacentHTML('beforeend', html);
      });
    }

    removeTag(tag) {
      const attrSelector = `option[value="${tag}"]`;
      TagManager.tagContainerIds.forEach(containerId => {
        const tagElement = this.find(`${containerId} ${attrSelector}`);
        if (tagElement) tagElement.remove();
      });

      this.contacts.removeTag(tag);
    }

    renderForm(contact) {
      const form = this.currentPage.querySelector('form:not(#search)');
      form.dataset.contactId = contact.id;
      form['edit_contact-full_name'].value = contact.full_name;
      form['edit_contact-email'].value = contact.email;
      form['edit_contact-phone_number'].value = contact.phone_number;

      if (contact.tags) {
        contact.tags.split(',').forEach(tag => {
          this.find(`option[value="${tag}"]`, form).setAttribute('selected', '');
        });
      }
    }

    showMessage(query) {
      const newSubPage = this.find('#message');
      if (this.currentSubPage === newSubPage) return;

      if (query) this.find('#message span').textContent = `containing ${query}`;
      this.hide(this.currentSubPage);
      this.currentSubPage = newSubPage;
      this.show(newSubPage);
    }

    hideMessage() {
      const newSubPage = this.find('#contacts');
      if (this.currentSubPage === newSubPage) return;

      this.find('#message span').textContent = null;
      this.hide(this.currentSubPage);
      this.currentSubPage = newSubPage;
      this.show(newSubPage);
    }
  };
})();
