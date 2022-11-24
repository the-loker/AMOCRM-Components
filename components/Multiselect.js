define([], function() {

  class Multiselect {
    constructor() {
      this.elem = '.js-component-multiselect';
      this.values = '.js-component-multiselect--values';
      this.elemList = '.js-component-multiselect-list';
      this.selectItem = '.js-component-multiselect-item';
      this.valueInput = '.js-component-multiselect-value';
      this.placeholder = '.input-multiselect--placeholder';
      this.removeValue = '.js-component-multiselect--remove';
    }

    select(e) {
      e.stopPropagation();
      const elem = e.target;

      if(!elem.closest(this.elemList)) return;

      const component = elem.closest(this.elem);
      const list = elem.closest(this.elemList);

      // Выбор элемента
      if(elem.classList.contains('js-component-multiselect-item')) {
        let items;

        // Если элемент выбран
        if(elem.classList.contains('selected')) {

          elem.classList.remove('selected');

          items = list.querySelectorAll(this.selectItem);
          const value = this.getValues(items);

          this.setValue(component, value);

          // Установка позиции выпадающего списка
          this.setPosition(component, component.offsetHeight);

          return;
        }

        elem.classList.add('selected');

        items = list.querySelectorAll(this.selectItem);
        const value = this.getValues(items);

        this.setValue(component, value);

        // Установка позиции выпадающего списка
        this.setPosition(component, component.offsetHeight);

        return;
      }
    }

    showList(e) {
      e.stopPropagation();

      if(e.target.classList.contains('js-component-multiselect--remove')) {
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
      const values = valueInput.value ? valueInput.value.split(',') : '';
      const items = component.querySelectorAll('li[data-value]');

      items.forEach((item) => {
        const val = item.getAttribute('data-value');

        if(!values) {
          item.classList.remove('selected');
        } else {
          if(values.includes(val)) {
            item.classList.add('selected');
          } else {
            item.classList.remove('selected');
          }
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

      input.setAttribute('value', values ? values.join(',') : '');

      this.trigger('change', input);
    }

    removeSelectedValue(e) {
      e.stopPropagation();

      if(!e.target.classList.contains('js-component-multiselect--remove')) {
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

      this.setValue(component, selectedValues);

      elemList.classList.remove('selected');

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
            class="selected-value-button js-component-multiselect--remove"
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

    trigger(event, element) {
      const trigger = new Event(event, { bubbles: true });

      element.dispatchEvent(trigger);
    }

    initHandlers() {
      window.addEventListener('resize', this.resize.bind(this));
      document.addEventListener('click', this.select.bind(this));
      document.addEventListener('click', this.showList.bind(this));

      // Фикс для AMOCRM
      document.addEventListener('mouseup', this.showList.bind(this));

      document.addEventListener('click', this.removeSelectedValue.bind(this));
      document.addEventListener('component:change', this.change.bind(this));
    }

    destroyHandlers() {
      window.removeEventListener('resize', this.resize);
      document.removeEventListener('click', this.showList);

      // Фикс для AMOCRM
      document.removeEventListener('mouseup', this.showList);

      document.removeEventListener('click', this.select);
      document.removeEventListener('click', this.removeSelectedValue);
      document.removeEventListener('component:change', this.change);
    }
  }

  return Multiselect;
});