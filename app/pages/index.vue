<script lang="ts" setup>
import type Quill from 'quill'
import { saveAs } from 'file-saver'

const model = ref('<p class="ql-align-right ql-indent-8">No <span class="mention" data-name="Proposal Number" data-value="{proposalNumber}" data-index="7" data-denotation-char=""><span contenteditable="false"><span class="ql-mention-denotation-char"></span><span class="ql-mention-value">{proposalNumber}</span></span></span> </p><p class="ql-align-right ql-indent-8"><br></p><p class="ql-align-right ql-indent-8"><br></p><p><br></p><p>Hi <span class="mention" data-index="4" data-denotation-char="" data-id="companyName" data-value="{companyName}"><span contenteditable="false"><span class="ql-mention-denotation-char"></span><span class="ql-mention-value">{companyName}</span></span></span></p><p><br></p><p>Once read in your job post i see you are looking somone vuejs developer who have experience to develop WYSIWYG. Like in this chat. This is chat demo only. Your <span class="mention" data-index="4" data-denotation-char="" data-id="companyName" data-value="{companyName}"><span contenteditable="false"><span class="ql-mention-denotation-char"></span><span class="ql-mention-value">{companyName}</span></span></span> based on <span class="mention" data-index="5" data-denotation-char="" data-id="companyAddress" data-value="{companyAddress}"><span contenteditable="false"><span class="ql-mention-denotation-char"></span><span class="ql-mention-value">{companyAddress}</span></span></span> will get some features like this one properly</p><p><br></p><p><br></p><p>Regards</p><p><br></p><p><span class="mention" data-index="1" data-denotation-char="" data-id="firstName" data-value="{firstName}"><span contenteditable="false"><span class="ql-mention-denotation-char"></span><span class="ql-mention-value">{firstName}</span></span></span> <span class="mention" data-index="2" data-denotation-char="" data-id="secondName" data-value="{secondName}"><span contenteditable="false"><span class="ql-mention-denotation-char"></span><span class="ql-mention-value">{secondName}</span></span></span></p><p><br></p><p><br></p><p><span class="mention" data-index="4" data-denotation-char="" data-id="companyName" data-value="{#company} {companyName} {/company}"><span contenteditable="false"><span class="ql-mention-denotation-char"></span><span class="ql-mention-value">{#company} {companyName} {/company}</span></span></span></p>')

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
  {
    name: 'Proposal Number',
    value: 'proposalNumber',
  },
]

const variableValues = computed(() => {
  return variables.flatMap((item) => {
    if (item.categories && item.items) {
      const categoryHeader = {
        id: item.categories,
        value: item.categories,
        disabled: true,
      }

      const items = item.items.map(dataItem => ({
        name: dataItem.name,
        id: dataItem.value,
        category: item.categories,
      }))

      return [
        categoryHeader,
        ...items,
      ]
    }

    return [
      {
        id: 'other',
        value: 'other',
        disabled: true,
        force: true, // just in case needed for logic later
      },
      {
        name: item.name,
        id: item.value,
        category: 'other',
        force: true,
      },
    ]
  })
})

const docxtemplater = ref({})

const convertDocxTemplated = () => {
  const regex = /class="mention"[^>]*data-index="(\d+)"/g
  const indexes = []
  const result = {}
  let match = regex.exec(model.value)

  while (match !== null) {
    indexes.push(Number(match[1]))
    match = regex.exec(model.value) // lanjutkan exec berikutnya
  }

  for (const idx of indexes) {
    const item = variableValues.value[idx]
    if (!item)
      continue

    const {
      id,
      category,
      force,
    } = item

    if (force) {
      if (!result[id])
        result[id] = ''
      continue
    }

    if (!category)
      continue

    if (!result[category]) {
      result[category] = {}
    }

    if (!result[category][id]) {
      result[category][id] = ''
    }
  }

  docxtemplater.value = result
}

const insertItem = (item: any) => {
  quill?.getModule('mention').insertItem(item)
}

const insertVariable = (dataItem: any, parentIndex: number) => {
  quill?.focus()

  quill?.getModule('mention').openMenu(dataItem.value.slice(0, 3))

  /// Check parent index
  const category = variables[parentIndex]?.categories

  const variableIndex = variableValues.value.findIndex((item: any) => item.id === dataItem.value)

  if (category) {
    insertItem({
      ...dataItem,
      index: variableIndex,
      value: `{${category}.${dataItem.value}}`,
    })
  }
  else {
    insertItem({
      ...dataItem,
      index: variableIndex,
      value: `{${dataItem.value}}`,
    })
  }
}

const exportToJson = () => {
  const delta = quill?.getContents()

  modelJson.value = delta
}

const handleReady = (instance: Quill) => {
  quill = instance
}

const exportToDocx = async () => {
  const html = quill?.root.innerHTML

  const res = await $fetch('/api/docx', {
    method: 'post',
    body: { html },
  })

  saveAs(res, 'output.docx')
}

const setDocxValue = (key: string, value: string) => {
  const data = docxtemplater.value

  // Root level
  if (key in data) {
    docxtemplater.value = {
      ...data,
      [key]: value,
    }
    return
  }

  // Nested level
  for (const category in data) {
    const group = data[category]
    if (typeof group === 'object' && group !== null && key in group) {
      docRef.value = {
        ...data,
        [category]: {
          ...group,
          [key]: value,
        },
      }
      return
    }
  }
}

const getDocxValue = (key: string) => {
  const data = docxtemplater.value

  if (key in data)
    return data[key]

  for (const category in data) {
    if (data[category]?.[key] !== undefined) {
      return data[category][key]
    }
  }

  return ''
}

const flattenedFields = computed(() => {
  const res: { label: string, key: string }[] = []

  Object.entries(docxtemplater.value).forEach(([
    category,
    value,
  ]) => {
    console.log(category, value)
    if (typeof value === 'object') {
      Object.keys(value).forEach((k) => {
        res.push({
          label: `${category} → ${k}`,
          key: k,
        })
      })
    }
    else {
      res.push({
        label: category,
        key: category,
      })
    }
  })

  console.log(docxtemplater.value)

  return res
})

watch(model, (value) => {
  if (value)
    convertDocxTemplated()
})

onMounted(() => {
  convertDocxTemplated()
})
</script>

<template>
  <div class=" w-full grid grid-cols-3 gap-4 p-4 min-h-screen">
    <div class="col-span-2 flex flex-col gap-3">
      <ClientOnly>
        <Editor
          v-model="model"
          :variable-values="variableValues"
          @ready="handleReady"
        />
      </ClientOnly>
    </div>

    <div class="col-span-1">
      <p class="mb-3 font-semibold">
        Variables
      </p>

      <template
        v-for="data, index in variables"
        :key="index"
      >
        <div
          v-if="data.categories"
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
                  @click="insertVariable(item, index)"
                >
                  {{ item.name }}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <button
          v-else
          class="cursor-pointer p-3 mt-3 rounded-lg shadow-md hover:bg-slate-100 font-semibold w-full text-start "
          @click="insertVariable(data, index)"
        >
          {{ data.name }}
        </button>
      </template>

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
          class="bg-base-100 shadow-lg p-4 mt-3"
        >
          <div class=" mb-3 capitalize font-semibold">
            Docxtemplater variable
          </div>

          {{ docxtemplater }}
        </div>

        <div class="space-y-3">
          <h2 class="text-lg font-bold">
            Fill Variables
          </h2>

          <!-- Input dinamis -->
          <div
            v-for="item in flattenedFields"
            :key="item.key"
            class="flex gap-2 items-center"
          >
            <label class="w-40 font-medium">{{ item.label }}</label>

            <input
              type="text"
              class="border px-2 py-1 rounded w-full"
              :value="getDocxValue(item.key)"
              @input="e => setDocxValue(item.key, e.target.value)"
            />
          </div>

          <h3 class="mt-4 font-semibold">
            Current Docxtemplater State:
          </h3>
          <pre class="bg-gray-100 p-3 rounded text-sm">{{ docxtemplater }}</pre>
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
