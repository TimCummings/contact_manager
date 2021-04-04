import { UI } from './UI.js';

export const ContactManager = (function() {
  const contacts = {};

  return class ContactManager {
    constructor(ui) {
      this.ui = ui;
      this.load();
    }

    all() {
      return Object.values(contacts);
    }

    search(query) {
      return Object.values(contacts).filter(contact => {
        return contact.full_name.includes(query);
      });
    }

    load() {
      fetch('/api/contacts')
        .then(response => {
          if (!response.ok) console.log('Error fetching contacts!');
          return response.json();
        })
        .then(data => {
          data.forEach(contact => {
            contacts[contact.id] = contact;
            this.ui.renderContact(contact);
          });
        })
        .catch(error => console.log('Error processing fetched contacts:', error));
    }

    handleButtonPress = (event) => {
      const button = event.target;
      switch (button.dataset.action) {
        case 'new': return this.newContact();
        case 'edit': return this.editContact(button.dataset.contactId);
        case 'delete': return this.deleteContact(button.dataset.contactId);
      }
    }

    handleFormSubmission = (event) => {
      const form = event.target;
      switch(form.dataset.action) {
        case 'new':
          this.saveContact(this.serializeForm(form));
          break;
        case 'edit':
          let id = form.dataset.contactId;
          this.updateContact(id, this.serializeForm(form, id));
          break;
      }
    }

    serializeForm(form, id) {
      const data = new FormData(form);
      const contactObj = {};
      const tags = [];

      for (let [key, value] of data.entries()) {
        key = key.split('-')[1];
        if (key === 'tags') {
          tags.push(value);
        } else {
          contactObj[key] = value;
        }
      }
      if (id) contactObj.id = Number(id);
      contactObj.tags = tags.join(',');

      return JSON.stringify(contactObj);
    }

    newContact() {
      this.ui.goTo('new_contact');
    }

    saveContact(data) {
      fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
      })
        .then(response => {
          if (!response.ok) alert(`Save contact request failed: ${response.statusText}`);
          return response.json();
        })
        .then(contact => {
          contacts[contact.id] = contact;
          this.ui.renderContact(contact);
          this.ui.goTo('home');
        })
        .catch(error => console.log('Error saving contact:', error));
    }

    editContact(id) {
      const contact = contacts[id];
      this.ui.goTo('edit_contact');
      this.ui.renderForm(contact);
    }

    updateContact(id, data) {
      fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: data,
      })
        .then(response => {
          if (!response.ok) alert(`Update contact request failed: ${response.statusText}`);
          return response.json();
        })
        .then(contact => {
          contacts[contact.id] = contact;
          this.ui.renderContact(contact);
          this.ui.goTo('home');
        })
        .catch(error => console.log('Error updating contact:', error));
    }

    deleteContact(id) {
      if (!confirm('Are you sure you want to delete this contact?')) return;

      fetch(`/api/contacts/${id}`, { method: 'DELETE' })
        .then(response => {
          if (response.ok) {
            delete contacts[id];
            this.ui.removeContact(id);
            this.ui.goTo('home');
          } else {
            alert(`Delete contact request failed: ${response.statusText}`);
          }
        })
        .catch(error => console.log('Error deleting contact:', error));
    }

    removeTag(tag) {
      Object.values(contacts).forEach(contact => {
        const tags = contact.tags.split(',');
        const tagIndex = tags.indexOf(tag);
        if (tagIndex > -1) tags.splice(tagIndex, 1);
        contacts[contact.id].tags = tags.join(',');
      });
    }

    tagFilter(selectedTag) {
      return Object.values(contacts).filter(contact => {
        if (!contact.tags) return false;

        const tags = contact.tags.split(',');
        return tags.includes(selectedTag);
      });
    }
  };
})();
