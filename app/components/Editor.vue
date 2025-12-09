<script setup lang="ts">
import type { QuillyEditor } from 'vue-quilly'
// import htmlToDocx from 'html-to-docx'
import Quill from 'quill'

import {
  Mention,
  MentionBlot,
} from 'quill-mention'

const emit = defineEmits(['ready'])

const model = defineModel()

const editor = ref<InstanceType<typeof QuillyEditor>>()

let quill: Quill | undefined

const variables = [
  {
    categories: 'person',
    items: [
      {
        name: 'First Name',
        value: 'firstName',
      },
      {
        name: 'Second Name',
        value: 'secondName',
      },
    ],
  },
  {
    categories: 'company',
    items: [
      {
        name: 'Company Name',
        value: 'companyName',
      },
      {
        name: 'Company Address',
        value: 'companyAddress',
      },
    ],
  },
]

const options = computed(() => {
  const values = variables.flatMap((category) => {
    const categoryHeader = {
      id: category.categories,
      value: category.categories,
      disabled: true,
    }

    const items = category.items.map(item => ({
      name: item.name,
      id: item.value,
      category: category.categories,
    }))

    return [
      categoryHeader,
      ...items,
    ]
  })

  const denotation = values.filter(item => !item.disabled).map(item => item.id.slice(0, 3))

  return {
    theme: 'snow',
    modules: {
      toolbar: [
        [
          { font: [] },
          { size: [] },
        ],
        [
          'bold',
          'italic',
          'underline',
          'strike',
        ],
        [
          { color: [] },
          { background: [] },
        ],
        [
          { script: 'super' },
          { script: 'sub' },
        ],
        [
          { header: '1' },
          { header: '2' },
          'blockquote',
          'code-block',
        ],
        [
          { list: 'ordered' },
          { list: 'bullet' },
          { indent: '-1' },
          { indent: '+1' },
        ],
        [
          'direction',
          { align: [] },
        ],
        [
          'link',
          'image',
          'video',
          'formula',
        ],
        ['clean'],
      ],
      mention: {
        allowedChars: /^[A-Z\sÅÄÖ]*$/i,
        minChars: 0,
        maxChars: 10,
        showDenotationChar: false,
        onSelect: (item: any, insertItem: any) => {
          insertItem({
            ...item,
            value: `{${item.id}}`,
          })
        },
        renderItem: (data: any) => {
          if (data.disabled) {
            const div = document.createElement('div')
            div.classList.add('category-header')
            div.textContent = data.value
            return div
          }
          return data.name
        },
        mentionDenotationChars: denotation,
        source(searchTerm: any, renderList: any) {
          renderList(values, searchTerm)
        },

      },
    },
    placeholder: 'Insert text here ...',
    readOnly: false,
  }
})

onMounted(() => {
  Quill.register({
    'blots/mention': MentionBlot,
    'modules/mention': Mention,
  })
  quill = editor.value?.initialize(Quill)

  emit('ready', quill)
})

defineExpose({ quill })
</script>

<template>
  <QuillyEditor
    ref="editor"
    v-model="model"
    :options="options"
  />
</template>
