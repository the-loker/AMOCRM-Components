define([
  'jquery',
  './components/MultiselectGroups.js?v=' + Date.now(),
  './components/Multiselect.js?v=' + Date.now(),
  './components/Select.js?v=' + Date.now(),
], function($, MultiselectGroups, Multiselect, Select) {
  return function() {
    const self = this;

    self.Select = new Select();
    self.Multiselect = new Multiselect();
    self.MultiselectGroups = new MultiselectGroups();

    function getTemplateAsync(template) {
      return new Promise((resolve, reject) => {
        self.render({
          href: `/templates/${template}.twig`,
          base_path: self.params.path,
          promised: true
        }).then(
          res => resolve(res),
          error => reject(error)
        );
      });
    }

    function initStyle(settings, fileName) {
      const file = $(`link[href="${ settings.path }/styles/${ fileName }.css?v=${ settings.version }"`);
      if(file.length < 1) {
        $("head").append(`
          <link 
            href="${ settings.path }/styles/${ fileName }.css?v=${ settings.version }"
            type="text/css"
            rel="stylesheet"
          >
        `)
      }
    }

    this.callbacks = {
      render: () => {
        return true;
      },
      settings: async () => {
        const settings = self.get_settings();

        initStyle(settings, 'components/style');

        const items = [
          { id: '1', option: 'Option 1' },
          { id: '2', option: 'Option 2' },
          { id: '3', option: 'Option 3' },
          { id: '4', option: 'Option 4' },
          { id: '5', option: 'Option 5' },
          { id: '6', option: 'Option 6' },
          { id: '7', option: 'Option 7' },
          { id: '8', option: 'Option 8' },
          { id: '9', option: 'Option 9' },
          { id: '10', option: 'Option 10' },
          { id: '11', option: 'Option 11' },
        ];
        
        const itemsGroups = [
          {
            group: 'Group 1',
            items: [
              { id: '1', option: 'Option - 1' },
              { id: '2', option: 'Option - 2' },
              { id: '3', option: 'Option - 3' },
              { id: '4', option: 'Option - 4' },
              { id: '5', option: 'Option - 5' },
            ]
          },
          {
            group: 'Group 2',
            items: [
              { id: '6', option: 'Option - 6' },
              { id: '7', option: 'Option - 7' },
              { id: '8', option: 'Option - 8' },
              { id: '9', option: 'Option - 9' },
              { id: '10', option: 'Option - 10' },
            ]
          },
          {
            group: 'Group 1',
            items: [
              { id: '11', option: 'Option - 11' },
              { id: '12', option: 'Option - 12' },
              { id: '13', option: 'Option - 13' },
              { id: '14', option: 'Option - 14' },
              { id: '15', option: 'Option - 15' },
            ]
          },
        ];
        
        try {
          const multiselect = await getTemplateAsync('components/multiselect');
          const multiselectGroups = await getTemplateAsync('components/multiselect-groups');
          const select = await getTemplateAsync('components/select');

          
          $('.widget-settings__desc-space').prepend(
            '<div style="margin-bottom: 10px;">' +
            select.render({
              name: 'www',
              items,
              selected: '1',
              search: true
            }) +
            '</div><div style="margin-bottom: 10px;">' +
            multiselect.render({
              name: 'test-input',
              items,
            }) +
            '</div><div style="margin-bottom: 10px;">' +
            multiselectGroups.render({
              name: 'test-input2',
              items: itemsGroups,
              selected: ['1', '2', '3', '4', '5'],
            })
          );
          
          // setTimeout(() => {
          //   const $input = $('input[name="www"]');

          //   $input.val('2');

          //   self.Select.trigger('component:change', $input.get(0));
          // }, 3000);

        } catch (error) {
          console.debug(error);
        }
        
        return true;
      },
      bind_actions: () => {
        self.Select.initHandlers();
        self.Multiselect.initHandlers();
        self.MultiselectGroups.initHandlers();
        
        return true;
      },
      destroy: () => {
        self.Select.destroyHandlers();
        self.Multiselect.destroyHandlers();
        self.MultiselectGroups.destroyHandlers();
        
        return true;
      },
      init: () => {
        return true;
      },
      onSave: () => {
        return true;
      },
    }
    
    return this;
  }
});