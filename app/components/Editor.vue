<script setup lang="ts">
import type { QuillyEditor } from 'vue-quilly'
import Quill from 'quill'

import {
  Mention,
  MentionBlot,
} from 'quill-mention'

interface Prop {
  variableValues: []
}

const props = defineProps<Prop>()
const emit = defineEmits(['ready'])
const model = defineModel()

const editor = ref<InstanceType<typeof QuillyEditor>>()

let quill: Quill | undefined

const options = computed(() => {
  const denotation = props.variableValues.filter(item => !item.disabled).map(item => item.id.slice(0, 3))
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
          if (props.variableValues[item.index].category && !props.variableValues[item.index].force) {
            insertItem({
              ...item,
              value: `{${props.variableValues[item.index].category}.${item.id}}`,
              // `{#${values[item.index].category}} {${item.id}} {/${values[item.index].category}}`,
            })
          }
          else {
            insertItem({
              ...item,
              value: `{${item.id}}`,
            })
          }
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
          console.log(props.variableValues)
          renderList(props.variableValues, searchTerm)
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
