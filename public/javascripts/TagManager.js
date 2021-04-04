import { UI } from './UI.js';

export const TagManager = (function() {
  const tags = [];

  return class TagManager {
    constructor(ui) {
      this.ui = ui;
      tags.length = 0;
    }

    all() {
      return tags.slice();
    }

    create(tag) {
      if (tags.includes(tag)) return `tag ${tag} already exists`;
      tags.push(tag);
      this.ui.renderTag(tag);
      this.ui.goTo('home');
    }

    delete(tag) {
      if (!tags.inlcudes(tag)) return `tag ${tag} does not exist`;
      const index = tags.indexOf(tag);
      return tags.splice(index, 1);
    }

    newTag() {
      this.ui.goTo('new_tag');
    }

    refresh(contact) {
      if (contact.tags) {
        contact.tags.split(',').forEach(tag => {
          if (!tags.includes(tag)) {
            tags.push(tag);
            this.ui.renderTag(tag);
          }
        });
      }
    }

    handleButtonPress = (event) => {
      const button = event.target;
      switch (button.dataset.action) {
        case 'new': return this.newTag();
      }
    }

    handleFormSubmission = (event) => {
      const form = event.target;
      this.create(form['new_tag-name'].value);
    }

    static tagContainerIds = ['#tag_controls-tag', '#new_contact-tags', '#edit_contact-tags'];
  };
})();
