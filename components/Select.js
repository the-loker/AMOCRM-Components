define(['underscore'], function(_) {

  class Select {
    constructor() {
      this.elem = '.js-component-select';
      this.value = '.js-component-select--value';
      this.elemList = '.js-component-select-list';
      this.selectItem = '.js-component-select-item';
      this.valueInput = '.js-component-select-value';
      this.placeholder = '.input-select--placeholder';
      this.removeValue = '.js-component-select--remove';
      this.searchInput = '.js-component-select-list-search';
      this.serchMessage = '.js-component-select-list-search-message';

      this.showList = this.showList.bind(this);
      this.select = this.select.bind(this);
      this.search = _.debounce(this.search.bind(this), 250);
      this.change = this.change.bind(this);
      this.resize = this.resize.bind(this);
      this.removeSelectedValue = this.removeSelectedValue.bind(this);
      this.hideList = this.hideList.bind(this);
    }

    select(e) {
      e.stopPropagation();
      const elem = e.target;

      if(!elem.closest(this.elemList)) return;

      const component = elem.closest(this.elem);
      const searchInput = component.querySelector(this.searchInput);
      const list = elem.closest(this.elemList);

      // Выбор элемента
      if(elem.classList.contains('js-component-select-item')) {

        // Если элемент выбран завершаем обработку
        if(elem.classList.contains('selected')) {

          // Сбросим строку поиска
          if(searchInput) {
            this.resetSearch(searchInput);
          }

          // Скрыть выпадающий список
          this.trigger('component:list:hide', list);

          return;
        };

        const selectedItem = list.querySelector(`${ this.selectItem }.selected`);

        if(selectedItem) {
          selectedItem.classList.remove('selected');
        }

        // Отметим выбранный элемент в списке
        elem.classList.add('selected');

        // Установить значение в input
        this.setValue(component, this.getValue(elem));

        // Сбросим строку поиска
        if(searchInput) {
          this.resetSearch(searchInput);
        }

        // Скрыть выпадающий список
        this.trigger('component:list:hide', list);

        return;
      }
    }

    showList(e) {
      e.stopPropagation();

      if(e.target.classList.contains('js-component-select--remove')) {
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

      // Если компонент отключен, прерываем обработку
      if(component.hasAttribute('disabled')) {
        return;
      }

      if(!e.target.classList.contains('js-component-select-list-search')) {
        // Отчистим строку поиска
        const searchInput = component.querySelector(this.searchInput);
        this.resetSearch(searchInput);
      }

      // Отчистим строку поиска
      const searchInput = component.querySelector(this.searchInput);
      this.resetSearch(searchInput);

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

    hideList(e) {
      const elem = e.target;
      const component = e.target.closest(this.elem);

      if(!component) return;

      setTimeout(() => {
        elem.classList.add('hidden');
      }, 1);
    }

    change(e) {
      const component = e.target.closest(this.elem);

      if(!component) return;

      const valueInput = component.querySelector(this.valueInput);
      const value = valueInput.value;
      const items = component.querySelectorAll('li[data-value]');

      items.forEach((item) => {
        const val = item.getAttribute('data-value');

        if(!value) {
          item.classList.remove('selected');
        } else {
          if(value == val) {
            item.classList.add('selected');
          } else {
            item.classList.remove('selected');
          }
        }
      });

      this.setValue(component, value);
    }

    search(e) {
      const elem = e.target;

      if(!elem.closest(this.elem)) return;

      const component = elem.closest(this.elem);
      const options = component.querySelectorAll(this.selectItem);
      const value = elem.value;

      // Скрываем сообщение о поиске
      component.querySelector(this.serchMessage)
        .classList.add('hidden');

      if(!value) {
        options.forEach(option => {
          option.classList.remove('hidden');
        });

        return;
      }

      options.forEach(option => {
        const optionText = option.innerText.toLowerCase();

        if(optionText.includes(value.toLowerCase())) {
          option.classList.remove('hidden');
        } else {
          option.classList.add('hidden');
        }
      });

      // Фильтруем найденные элементы
      const visibleElems = Array.prototype.filter.call(options, function(elem) {
        return !elem.classList.contains('hidden');
      });

      // Если найденых элементов нет, покажем сообщение
      if(!visibleElems.length) {
        component.querySelector(this.serchMessage)
          .classList.remove('hidden');
      }
    }

    // Отчистить строку поиска
    resetSearch(elem) {
      if(!elem.value) return;

      const component = elem.closest(this.elem);
      
      // Скрыть сообщение поиска
      component.querySelector(this.serchMessage)
        .classList.add('hidden');

      elem.value = '';

      this.trigger('input', elem);
    }

    // Получить значение выбраного элемента
    getValue(elem) {
      return elem.getAttribute('data-value');
    }

    setValue(component, value) {
      const input = component.querySelector(this.valueInput);
      const elemValues = component.querySelector(this.value);
      const placeholder = component.querySelector(this.placeholder);

      if(value) {
        const items = component
          .querySelector(this.elemList)
          .querySelectorAll(this.selectItem);

        this.removeNodes(elemValues);

        items.forEach(item => {
          const id = item.getAttribute('data-value');
          const option = item.innerText;

          if(value == id) {
            const node = this.createNode(id, option);

            placeholder.classList.add('hidden');

            elemValues.append(node);
          }
        });
      } else {
        this.removeNodes(elemValues);

        placeholder.classList.remove('hidden');
      }

      input.setAttribute('value', value ? value : '');

      this.trigger('change', input);
    }

    removeSelectedValue(e) {
      e.stopPropagation();

      if(!e.target.classList.contains('js-component-select--remove')) {
        return;
      }

      const component = e.target.closest(this.elem);
      const list = component.querySelector(this.elemList);

      if(component.hasAttribute('disabled')) {
        return;
      }

      const elem = e.target.closest('.selected-value');
      const value = elem.getAttribute('data-id');
      const elemList = component.querySelector(`li[data-value="${ value }"]`);

      this.setValue(component, '');

      elemList.classList.remove('selected');

      // Скрываем список значений
      list.classList.add('hidden');

      // Отчистим строку поиска
      const searchInput = component.querySelector(this.searchInput);
      this.resetSearch(searchInput);

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
            class="selected-value-button js-component-select--remove"
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
      window.addEventListener('resize', this.resize);
      document.addEventListener('click', this.select);
      document.addEventListener('click', this.showList);
      document.addEventListener('input', this.search);

      // Фикс для AMOCRM
      document.addEventListener('mouseup', this.showList);

      document.addEventListener('click', this.removeSelectedValue);
      document.addEventListener('component:change', this.change);
      document.addEventListener('component:list:hide', this.hideList);
    }


    destroyHandlers() {
      window.removeEventListener('resize', this.resize);
      document.removeEventListener('click', this.select);
      document.removeEventListener('click', this.showList);
      document.removeEventListener('input', this.search);

      // Фикс для AMOCRM
      document.removeEventListener('mouseup', this.showList);

      document.removeEventListener('click', this.removeSelectedValue);
      document.removeEventListener('component:change', this.change);
      document.removeEventListener('component:list:hide', this.hideList);
    }
  }

  return Select;
});