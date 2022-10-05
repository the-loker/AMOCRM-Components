define([], function() {

  class MultiselectGroups {

    constructor() {
      this.elem = '.js-component-multiselect-groups';
      this.values = '.js-component-multiselect--values';
      this.elemList = '.js-component-multiselect-groups-list';
      this.elemGroup = '.js-component-multiselect--group';
      this.selectGroup = '.js-component-multiselect--select-group';
      this.selectItem = '.js-component-multiselect--group-item';
      this.valueInput = '.js-component-multiselect-groups-value';
      this.placeholder = '.input-multiselect--placeholder';
      this.removeValue = '.js-component-multiselect-groups--remove';
    }

    select(e) {
      e.stopPropagation();
      const elem = e.target;

      if(!elem.closest(this.elemList)) return;

      const component = elem.closest(this.elem);
      const list = elem.closest(this.elemList);

      // Выбор группы элементов
      if(elem.classList.contains('js-component-multiselect--select-group')) {
        const isSelected = elem.getAttribute('data-selected');
        const group = elem.closest(this.elemGroup);
        let items;

        // Выбраны не все элементы группы
        if(isSelected == 'false') {
          const groupItems = group.querySelectorAll(this.selectItem);

          Array.prototype.forEach.call(groupItems, (item) => {
            item.classList.add('selected');
          });

          elem.setAttribute('data-selected', 'true');

          items = list.querySelectorAll(this.selectItem);
          const value = this.getValues(items);

          this.setValue(component, value);

          // Установка позиции выпадающего списка
          this.setPosition(component, component.offsetHeight);

          return;
        }

        // Выбраны все элементы группы

        const groupItems = group.querySelectorAll(this.selectItem);

        groupItems.forEach((item) => {
          item.classList.remove('selected');
        });

        elem.setAttribute('data-selected', 'false');

        items = list.querySelectorAll(this.selectItem);
        const value = this.getValues(items);

        this.setValue(component, value);

        // Установка позиции выпадающего списка
        this.setPosition(component, component.offsetHeight);

        return;
      }

      // Выбор элемента в группе
      if(elem.classList.contains('js-component-multiselect--group-item')) {
        const group = elem.closest(this.elemGroup);
        const groupBtn = group.querySelector(this.selectGroup);
        let items;

        // Если элемент выбран
        if(elem.classList.contains('selected')) {

          elem.classList.remove('selected');
          groupBtn.setAttribute('data-selected', 'false');

          items = list.querySelectorAll(this.selectItem);
          const value = this.getValues(items);

          this.setValue(component, value);

          return;
        }

        elem.classList.add('selected');

        items = list.querySelectorAll(this.selectItem);
        const value = this.getValues(items);

        this.setValue(component, value);

        return;
      }
    }

    showList(e) {
      e.stopPropagation();

      if(e.target.classList.contains('js-component-multiselect-groups--remove')) {
        return;
      }

      const elems = document.querySelectorAll(this.elem);
      const component = e.target.closest(this.elem);

      
      if(!component) {
        // Закроем все открытые селекторы
        elems.forEach(elem => {
          if(elem != component) {
            const list = elem.querySelector(this.elemList);
            
            if(!list.classList.contains('hidden')) {
              list.classList.add('hidden');
            }
          }
        });

        return;
      }
      
      if(component.hasAttribute('disabled')) {
        return;
      }

      // Закроем все открытые селекторы кроме текущего
      elems.forEach(elem => {
        if(elem != component) {
          const list = elem.querySelector(this.elemList);

          if(!list.classList.contains('hidden')) {
            list.classList.add('hidden');
          }
        }
      });

      const currentList = component.querySelector(this.elemList);

      if(currentList.classList.contains('hidden')) {
        currentList.classList.remove('hidden');

        this.setPosition(component, component.offsetHeight);
      }
    }

    change(e) {
      const component = e.target.closest(this.elem);

      if(!component) return;

      const valueInput = component.querySelector(this.valueInput);
      const values = valueInput.value.split(',');

      const items = component.querySelectorAll('li[data-value]');

      items.forEach((item) => {
        const val = item.getAttribute('data-value');

        if(values.includes(val)) {
          item.classList.add('selected');
        }
      });

      this.setValue(component, values);
    }

    // Получить значения выбраных элементов
    getValues(items) {
      return Array.prototype.reduce.call(items, (acc, item) => {
        if(item.classList.contains('selected')) {
          const val = item.getAttribute('data-value');

          if(val) {
            acc.push(val);
          }
        }

        return acc;
      }, []);
    }

    setValue(component, values) {
      const input = component.querySelector(this.valueInput);
      const elemValues = component.querySelector(this.values);
      const placeholder = component.querySelector(this.placeholder);

      if(values.length) {
        const items = component
          .querySelector(this.elemList)
          .querySelectorAll(this.selectItem);

        this.removeNodes(elemValues);

        items.forEach(item => {
          const id = item.getAttribute('data-value');
          const option = item.innerText;

          if(values.includes(id)) {
            const node = this.createNode(id, option);

            placeholder.classList.add('hidden');

            elemValues.append(node);
          }
        });
      } else {
        this.removeNodes(elemValues);

        placeholder.classList.remove('hidden');
      }

      input.setAttribute('value', values.join(','));
    }

    removeSelectedValue(e) {
      e.stopPropagation();

      if(!e.target.classList.contains('js-component-multiselect-groups--remove')) {
        return;
      }

      const component = e.target.closest(this.elem);

      if(component.hasAttribute('disabled')) {
        return;
      }

      const elem = e.target.closest('.selected-value');
      const value = elem.getAttribute('data-id');
      const elemList = component.querySelector(`li[data-value="${ value }"]`);

      const input = component.querySelector(this.valueInput);
      const values = input.value.split(',');
      const selectedValues = values.filter((val) => val != value);

      // Если нет элемента то переустановим значения
      if(!elemList) {
        this.setValue(component, selectedValues);

        return;
      }

      const groupBtn = elemList.closest(this.elemGroup).querySelector(this.selectGroup);


      this.setValue(component, selectedValues);

      elemList.classList.remove('selected');

      if(groupBtn.getAttribute('data-selected') == 'true') {
        groupBtn.setAttribute('data-selected', 'false');
      }

      this.setPosition(component, component.offsetHeight);
    }

    setPosition(component, height) {
      const list = component.querySelector(this.elemList);

      list.style = `top: ${ height + 4 }px`;
    }

    createNode(id, option) {
      const node = document.createElement('div');

      node.dataset.id = id;
      node.className = 'selected-value';

      node.innerHTML = `
        <div class="selected-value--text">${ option }</div>
        <div class="selected-value--btn-container">
          <button
            class="selected-value-button js-component-multiselect-groups--remove"
            type="button"
          >&times;</button>
        </div>
      `;

      return node;
    }
    
    removeNodes(elemValues) {
      const nodes = elemValues.querySelectorAll('.selected-value');

      nodes.forEach(node => {
        node.remove();
      });
    }

    resize() {
      const elems = document.querySelectorAll(this.elem);

      elems.forEach(elem => {
        this.setPosition(elem, elem.offsetHeight);
      });
    }

    initHandlers() {
      window.addEventListener('resize', this.resize.bind(this));
      document.addEventListener('click', this.select.bind(this));
      document.addEventListener('click', this.showList.bind(this));
      document.addEventListener('click', this.removeSelectedValue.bind(this));
      document.addEventListener('component:change', this.change.bind(this));
    }

    destroyHandlers() {
      window.removeEventListener('resize', this.resize);
      document.removeEventListener('click', this.showList);
      document.removeEventListener('click', this.select);
      document.removeEventListener('click', this.removeSelectedValue);
      document.removeEventListener('component:change', this.change);
    }
  }

  return MultiselectGroups;
});