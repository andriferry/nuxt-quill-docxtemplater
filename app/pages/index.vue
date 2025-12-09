<script lang="ts" setup>
import type Quill from 'quill'
import { saveAs } from 'file-saver'

const model = ref('<p>Hi  <span class="mention" data-index="4" data-denotation-char="" data-id="companyName" data-value="{companyName}"><span contenteditable="false"><span class="ql-mention-denotation-char"></span><span class="ql-mention-value">{companyName}</span></span></span> </p><p><br></p><p>Once read in your job post i see you are looking somone vuejs developer who have experience to develop WYSIWYG. Like in this chat. This is chat demo only. Your <span class="mention" data-index="4" data-denotation-char="" data-id="companyName" data-value="{companyName}"><span contenteditable="false"><span class="ql-mention-denotation-char"></span><span class="ql-mention-value">{companyName}</span></span></span>  based on <span class="mention" data-index="5" data-denotation-char="" data-id="companyAddress" data-value="{companyAddress}"><span contenteditable="false"><span class="ql-mention-denotation-char"></span><span class="ql-mention-value">{companyAddress}</span></span></span>   will get some features like this one properly</p><p><br></p><p><br></p><p>Regards</p><p><br></p><p><span class="mention" data-index="1" data-denotation-char="" data-id="firstName" data-value="{firstName}"><span contenteditable="false"><span class="ql-mention-denotation-char"></span><span class="ql-mention-value">{firstName}</span></span></span> <span class="mention" data-index="2" data-denotation-char="" data-id="secondName" data-value="{secondName}"><span contenteditable="false"><span class="ql-mention-denotation-char"></span><span class="ql-mention-value">{secondName}</span></span></span> </p><p><br></p><p>   </p>')

const modelJson = ref<any>()
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

const docxtemplater = ref()

const insertVariable = (dataItem: any) => {
  quill?.focus()

  quill?.getModule('mention').openMenu(dataItem.value.slice(0, 3))

  quill?.getModule('mention').insertItem({
    ...dataItem,
    value: `{${dataItem.value}}`,
  })
}

const exportToJson = () => {
  const delta = quill?.getContents()

  modelJson.value = delta
}

const handleReady = (instance: Quill) => {
  quill = instance
}

const exportTodocxtemplater = () => {
  const delta = quill?.getContents()
  const uniqueIds = [...new Set(
    delta.ops
      .filter(op => op.insert?.mention?.id)
      .map(op => op.insert.mention.id),
  )]

  // ---- Convert to Object Format ----
  docxtemplater.value = uniqueIds.reduce((acc, id) => {
    acc[id] = ''
    return acc
  }, {})
}

const exportToDocx = async () => {
  const html = quill?.root.innerHTML

  const res = await $fetch('/api/docx', {
    method: 'post',
    body: { html },
  })

  saveAs(res, 'output.docx')
}
</script>

<template>
  <div class=" w-full grid grid-cols-3 gap-4 p-4 min-h-screen">
    <div class="col-span-2 flex flex-col gap-3">
      <ClientOnly>
        <Editor
          v-model="model"
          @ready="handleReady"
        />
      </ClientOnly>
    </div>

    <div class="col-span-1">
      <p class="mb-3 font-semibold">
        Variables
      </p>

      <div
        v-for="data, index in variables"
        :key="index"
        :tabindex="index"
        class="collapse collapse-arrow bg-base-100 shadow-md"
      >
        <div class="collapse-title capitalize font-semibold">
          {{ data.categories }}
        </div>
        <div class="collapse-content text-sm">
          <ul class="list bg-base-100 rounded-box ">
            <li
              v-for="item, indexItem in data.items"
              :key="indexItem"
              class=""
            >
              <button
                class="cursor-pointer p-3 rounded-lg hover:bg-slate-100 font-semibold w-full text-start "
                @click="insertVariable(item)"
              >
                {{ item.name }}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-3">
        <p class="font-semibold">
          Output
        </p>

        <div
          tabindex="90"
          class="collapse collapse-arrow bg-base-100 shadow-md"
        >
          <div class="collapse-title capitalize font-semibold">
            Export To Html
          </div>

          <div class="collapse-content text-sm">
            {{ model }}
          </div>
        </div>

        <div
          tabindex="190"
          class="collapse collapse-arrow bg-base-100 shadow-md"
          @click="exportToJson"
        >
          <div class="collapse-title capitalize font-semibold">
            Export To JSON
          </div>

          <div class="collapse-content text-sm">
            <p class="overflow-auto">
              {{ modelJson }}
            </p>
          </div>
        </div>

        <div
          tabindex="200"
          class="collapse collapse-arrow bg-base-100 shadow-md"
          @click="exportTodocxtemplater"
        >
          <div class="collapse-title capitalize font-semibold">
            Docxtemplater variable
          </div>

          <div class="collapse-content text-sm">
            <p class="overflow-auto">
              {{ docxtemplater }}
            </p>
          </div>
        </div>

        <div class="mt-4">
          <button
            class="px-3 py-1 text-white cursor-pointer bg-sky-400 rounded-lg"
            @click="exportToDocx"
          >
            Export To Docx
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.ql-mention-list-container) {
  background-color: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(30, 30, 30, 0.08);
}

:deep(.ql-mention-list-item) {
  cursor: pointer;
  font-size: 16px;
  line-height: 44px;
  padding: 0 20px;
  vertical-align: middle;
}

:deep(.ql-mention-list-item.disabled) {
  padding: 0px;
  line-height: normal;
}

:deep(.ql-mention-list-item.disabled) {
  cursor: auto;
}
:deep(.ql-mention-list-item.selected) {
  background-color: #d3e1eb;
  text-decoration: none;
}

:deep(.mention) {
  background-color: #d3e1eb;
  border-radius: 6px;
  height: 24px;
  margin-right: 2px;
  padding: 3px 0;
  user-select: all;
  width: 65px;
}

:deep(.ql-mention-value) {
  padding: 0px 5px;
}

:deep(.category-header) {
  padding: 10px;
  background-color: #ccc;
  font-size: 16px;
  text-transform: capitalize;
}
</style>
