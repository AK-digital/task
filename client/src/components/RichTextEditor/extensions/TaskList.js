import { Node, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

export const TaskList = Node.create({
  name: 'taskList',

  addOptions() {
    return {
      itemTypeName: 'taskItem',
      HTMLAttributes: {},
    }
  },

  group: 'block list',

  content() {
    return `${this.options.itemTypeName}+`
  },

  parseHTML() {
    return [
      {
        tag: `ul[data-type="${this.name}"]`,
        priority: 51,
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'ul',
      mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
        {
          'data-type': this.name,
        },
      ),
      0,
    ]
  },

  addCommands() {
    return {
      toggleTaskList: () => ({ commands }) => {
        return commands.toggleList(this.name, this.options.itemTypeName)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-9': () => this.editor.commands.toggleTaskList(),
    }
  },
})

export const TaskItem = Node.create({
  name: 'taskItem',

  addOptions() {
    return {
      nested: false,
      HTMLAttributes: {},
    }
  },

  content() {
    return this.options.nested ? 'paragraph block*' : 'paragraph'
  },

  defining: true,

  addAttributes() {
    return {
      checked: {
        default: false,
        keepOnSplit: false,
        parseHTML: element => element.getAttribute('data-checked') === 'true',
        renderHTML: attributes => ({
          'data-checked': attributes.checked,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: `li[data-type="${this.name}"]`,
        priority: 51,
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'li',
      mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
        {
          'data-type': this.name,
        },
      ),
      [
        'label',
        {
          class: 'task-list-item-checkbox',
          contenteditable: 'false',
        },
        [
          'input',
          {
            type: 'checkbox',
            checked: node.attrs.checked ? 'checked' : null,
          },
        ],
      ],
      [
        'div',
        {
          class: `task-list-item-content ${node.attrs.checked ? 'checked' : ''}`,
        },
        0,
      ],
    ]
  },

  addKeyboardShortcuts() {
    const shortcuts = {
      Enter: () => this.editor.commands.splitListItem(this.name),
      'Shift-Tab': () => this.editor.commands.liftListItem(this.name),
    }

    if (!this.options.nested) {
      return shortcuts
    }

    return {
      ...shortcuts,
      Tab: () => this.editor.commands.sinkListItem(this.name),
    }
  },

  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const listItem = document.createElement('li')
      const checkboxWrapper = document.createElement('label')
      const checkbox = document.createElement('input')
      const content = document.createElement('div')

      // Configuration des attributs
      listItem.setAttribute('data-type', this.name)
      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        listItem.setAttribute(key, value)
      })

      checkboxWrapper.classList.add('task-list-item-checkbox')
      checkboxWrapper.contentEditable = 'false'

      checkbox.type = 'checkbox'
      checkbox.checked = node.attrs.checked

      content.classList.add('task-list-item-content')
      if (node.attrs.checked) {
        content.classList.add('checked')
      }

      // Gestionnaire de clic sur la checkbox
      checkbox.addEventListener('change', (event) => {
        if (typeof getPos === 'function') {
          editor.view.dispatch(
            editor.view.state.tr.setNodeMarkup(getPos(), undefined, {
              ...node.attrs,
              checked: event.target.checked,
            })
          )
        }
      })

      checkboxWrapper.appendChild(checkbox)
      listItem.appendChild(checkboxWrapper)
      listItem.appendChild(content)

      return {
        dom: listItem,
        contentDOM: content,
        update: (updatedNode) => {
          if (updatedNode.type !== this.type) {
            return false
          }

          checkbox.checked = updatedNode.attrs.checked
          
          if (updatedNode.attrs.checked) {
            content.classList.add('checked')
          } else {
            content.classList.remove('checked')
          }

          return true
        },
      }
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('taskItemClickHandler'),
        props: {
          handleClick: (view, pos, event) => {
            const { schema } = view.state
            const coordinates = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            })

            if (!coordinates) {
              return false
            }

            const node = view.state.doc.nodeAt(coordinates.pos)
            const $pos = view.state.doc.resolve(coordinates.pos)

            if (node && node.type === schema.nodes[this.name]) {
              const checkbox = event.target.closest('input[type="checkbox"]')

              if (checkbox) {
                const { tr } = view.state

                view.dispatch(
                  tr.setNodeMarkup(coordinates.pos, undefined, {
                    ...node.attrs,
                    checked: checkbox.checked,
                  })
                )

                return true
              }
            }

            return false
          },
        },
      }),
    ]
  },
})
