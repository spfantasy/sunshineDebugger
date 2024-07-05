<script setup>
import {
  Divider,
  FormItem,
  Icon,
  InputNumber,
  Message,
  Modal,
  Radio,
  RadioGroup,
  Row,
  Space,
  Switch, Tooltip
} from "view-ui-plus";
import {ref, reactive, computed, onMounted} from "vue";
import Codemirror from "codemirror-editor-vue3";
import "codemirror/theme/yeti.css"
import jsonlint from "jsonlint-mod";
// language json or js
import "codemirror/mode/javascript/javascript.js";
import "codemirror/addon/lint/lint.css";
import "codemirror/addon/lint/lint.js";
import "codemirror/addon/lint/json-lint";

import JSON5 from "json5";
import {getNode, listNode} from "@/components/electronAPI.js";

window.jsonlint = jsonlint;

const props = defineProps({
  header: {
    type: String,
    required: true,
  },
  allowSubmit: {
    type: Boolean,
    required: true,
  },
  allowDelete: {
    type: Boolean,
    required: true,
  },
  allowCancel: {
    type: Boolean,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
  nodeValue: {
    type: String,
    required: true,
  },
})
onMounted(() => {
  if (props.nodeValue === "") {
    data.value =   {
      value: null,
      label: null,
      type: "input",
      inDegree: null,
      circuitBreaker: false,
      parents: [],
      inference: {
        retrievers: [],
        component: {},
        success: ""
      }
    }
  } else {
    loadNode(props.nodeValue);
  }
})
const data = ref({});
const jsonError = ref("");
const loading = ref(false);
const rules = ref({});
const parentList = ref([]);
const exampleComponent = ref({
  "type": 'div',
  "children": [
    {
      "type": "Row",
      "children": [
        {
          "type": "Col",
          "span": "4",
          "innerHTML": "`解析写入的内容:${ctx.outputModule1?.data?.attr1}`"
        },
        {
          "type": "Col",
          "span": "20",
          "innerHTML": "`456:${ctx.outputModule1?.data?.attr2}`"
        }
      ]
    },
    {
      "type": "Row",
      "children": [
        {
          "type": "Col",
          "span": "24",
          "innerHTML": "非HTML标签基于view-ui-plus，请查询官方文档"
        }
      ]
    }
  ]
});
const dataType = computed({
  get() {
    return data.value.type;
  },
  set(newValue) {
      data.value.type = newValue;
      if (newValue === 'input') {
        data.value.inference.component = null;
      } else {
        data.value.inference.component = exampleComponent.value;
      }
  }
})
const inDegree = computed({
  get() {
    return data.value.inDegree;
  },
  set(newValue) {
    if (newValue < 0) {
      data.value.inDegree = null;
    } else {
      data.value.inDegree = newValue;
    }
  }
})
// const componentString = computed({
//   get() {
//     return JSON5.stringify(data.value.inference?.component || {}, null, 2);
//   },
//   set(newValue) {
//     try {
//       data.value.inference.component = JSON5.parse(newValue);
//       jsonError.value = null;
//     } catch (e) {
//       jsonError.value = e.message;
//     }
//   }
// });
const componentString = ref(`{
      "compilerOptions": {
        "baseUrl": ".",
        "outDir": "temp",
        "sourceMap": false,
        "target": "es2016",
        "newLine": "LF",
        "useDefineForClassFields": false,
        "module": "esnext",
        "moduleResolution": "bundler",
        "allowJs": true,
        "strict": true,
        "noUnusedLocals": true,
        "experimentalDecorators": true,
        "resolveJsonModule": true,
        "isolatedModules": true,
        "skipLibCheck": true,
        "esModuleInterop": true,
        "removeComments": false,
        "jsx": "preserve",
        "lib": ["es2016", "dom"],
        "types": ["vitest/globals", "puppeteer", "node"],
        "rootDir": ".",
        "paths": {
          "@vue/compat": ["packages/vue-compat/src"],
          "@vue/*": ["packages/*/src"],
          "vue": ["packages/vue/src"]
        }
      },
      "include": [
        "packages/global.d.ts",
        "packages/*/src",
        "packages/runtime-dom/types/jsx.d.ts",
        "packages/*/__tests__",
        "packages/dts-test",
        "packages/vue/jsx-runtime",
        "scripts/*",
        "rollup.*.js"
      ]
    }`);
function enableInDegree() {
  inDegree.value = data.value.parents?.length || 0;
}

async function loadNode(nodeName) {
  try {
    data.value = await getNode(nodeName);
  } catch (error) {
    console.error(error.message);
    Message.error(error.message);
  }
}

async function searchParentNode(keyword) {
  try {
    loading.value = true;
    parentList.value = await listNode(keyword);
    loading.value = false;
  } catch (error) {
    loading.value = false;
    console.error(error.message);
    Message.error(error.message);
  }
}



function submit() {
  console.log(data.value);
}
function cancel() {
  loading.value = false;
  props.active = false;
}

// https://rennzhang.github.io/codemirror-editor-vue3/zh-CN/guide/getting-started

const cmRef = ref();
const cmOptions = reactive({
  mode: "application/json",
  lineNumbers: true,
  lineWiseCopyCut: true,
  gutters: ["CodeMirror-lint-markers"],
  lint: true,
  theme: "yeti"
});

async function debug(content, instance) {
  console.log(content);
}
</script>

<template>
  <Modal v-if="props.active" v-model="data" width="720" :mask-closable="false">
    <template #header>
      <p style="text-align:center">
        <span>{{ props.header }}</span>
      </p>
    </template>
    <div>
      <Form :model="data" :rules="rules" :label-width="80">
        <FormItem prop="value" label="节点id">
          <Space>
            <Input v-model="data.value" placeholder="inputNodeX" style="width: 300px"/>
            <Tooltip max-width="200" content="节点主键，请输入只包含字母数字的内容" placement="top">
              <Icon type="ios-help-circle"/>
            </Tooltip>
          </Space>
        </FormItem>
        <FormItem prop="label" label="节点名称">
          <Space>
            <Input v-model="data.label" placeholder="模块-场景-子模块-流程" style="width: 300px"/>
            <Tooltip max-width="200" content="节点中文名称，如‘模块-场景-子模块-流程’" placement="top">
              <Icon type="ios-help-circle"/>
            </Tooltip>
          </Space>
        </FormItem>
        <FormItem prop="value" label="节点类型">
          <Space>
            <RadioGroup v-model="dataType" type="button" button-style="solid">
              <Radio label="input">输入</Radio>
              <Radio label="output">输出</Radio>
            </RadioGroup>
            <Tooltip max-width="200" content="输入节点：包含搜索框（备选项=choices，选中项=selection），请提供choices:[{value: xxx, label: yyy}] 和 selection: someValue；输出节点：包含摘要abstract和边栏，请提供abstract=someString和边栏json" placement="top">
              <Icon type="ios-help-circle"/>
            </Tooltip>
          </Space>
        </FormItem>
        <FormItem prop="parents" label="父节点">
          <Space>
            <Select v-model="data.parents" style="width: 500px" multiple
            :remote-method="searchParentNode" :loading="loading" filterable>
              <Option v-for="(option, index) in parentList" :value="option.value" :key="index">{{option.label}}</Option>
            </Select>
            <Tooltip max-width="200" content="父节点会阻碍节点的运行（例如存在数据上的依赖），当成功的父节点数>=入度时触发该节点的执行" placement="top">
              <Icon type="ios-help-circle"/>
            </Tooltip>
          </Space>
        </FormItem>
        <FormItem prop="inDegree" label="入度">
          <Space>
            <div v-if="inDegree == null">
              等于父节点数
              <Button type="dashed" @click="enableInDegree">切换</Button>
            </div>
            <div v-if="inDegree != null">
              <InputNumber controls-outside :min="-1" :max="data.parents?.length || 0" v-model="inDegree"/>
            </div>
            <Tooltip max-width="200" content="默认为父节点数目（父节点都成功后触发该节点），覆盖后，x个父节点成功后即可触发该节点执行（请自行保证数据依赖关系）" placement="top">
              <Icon type="ios-help-circle"/>
            </Tooltip>
          </Space>
        </FormItem>
        <FormItem prop="circuitBreaker" label="熔断">
          <Space>
            <Switch true-color="#13ce66" false-color="#ff4949" v-model="data.circuitBreaker"/>
            <Tooltip max-width="200" content="配置熔断后，执行失败不显示该节点（适用于分支判断逻辑）；此特性也会影响焦点的展示逻辑" placement="top">
              <Icon type="ios-help-circle"/>
            </Tooltip>
          </Space>
        </FormItem>
        <Divider orientation="left">推断</Divider>
        <FormItem>
          <Row>
            <Col span="6">
              <Button type="dashed" icon="md-add">新增推断</Button>
            </Col>
            <Col span="6">
              <Button type="error" icon="md-trash">删除推断</Button>
            </Col>
          </Row>
        </FormItem>
        <template v-for="(retriever, i1) in data.retrievers">
          <FormItem label="数据源" :prop="'inference.retrievers.' + i1 + '.datasource'">
            <Space>
              <Select v-model="retriever.datasource" style="width: 300px">
                <Option value="beijing">New York</Option>
                <Option value="shanghai">London</Option>
                <Option value="shenzhen">Sydney</Option>
              </Select>
              <Icon type="ios-help-circle"/>
            </Space>
          </FormItem>
          <FormItem label="查询语句" :prop="'inference.retrievers.' + i1 + '.query'">
            <Space>
              <Input v-model="retriever.query" placeholder="default size"/>
              <Icon type="ios-help-circle"/>
            </Space>
          </FormItem>
          <FormItem label="查询参数" :prop="'inference.retrievers.' + i1 + '.queryParams'">
            <Space>
              <Select v-model="retriever.query" multiple style="width:500px" filterable allow-create
                      @on-create="handleCreate1">
              </Select>
              <Icon type="ios-help-circle"/>
            </Space>
          </FormItem>
          <template v-for="(sinker, i2) in retriever.sink">
            <Space>
              <FormItem label="写入" :prop="'inference.retrievers.' + i1 + '.sink.' + i2 + '.statement'">
                <Input v-model="sinker.statement" placeholder=""/>
                <Switch size="large">
                  <template #open>
                    <Icon type="ios-arrow-down"/>
                  </template>
                  <template #close>
                    <Icon type="ios-arrow-back"/>
                  </template>
                </Switch>
              </FormItem>
              <FormItem label="当" :prop="'inference.retrievers.' + i1 + '.sink.' + i2 + '.if'">
                <Input v-model="sinker.if" placeholder=""/>
              </FormItem>
            </Space>
          </template>
        </template>
        <FormItem prop="inference.success" label="是否成功">
          <Space>
            <Input v-model="data.inference.success" placeholder="为空默认为‘成功’"/>
            <Icon type="ios-help-circle"/>
          </Space>
        </FormItem>
        <FormItem prop="inference.component" label="边栏" v-if="data.type === 'output'">
          <Codemirror
              v-model:value="componentString"
              :options="cmOptions"
              height="400px"
              width="90%"
              class="cm-component"
              :border="true"
              @change="debug"
          />
          <Tooltip max-width="200" content="用于渲染边栏的内容，支持view-ui-plus的Row, Col, Grid, GridItem, Divider, Ellipsis, Tabs, TabPane, Timeline, TimelineItem, Numeral组件，以及html默认组件。请参考示例中的逻辑" placement="top">
            <Icon type="ios-help-circle"/>
          </Tooltip>
        </FormItem>
      </Form>
    </div>
    <template #footer>
      <Space>
        <Button type="primary" size="large" :loading="loading" @click="submit">提交</Button>
        <Button type="error" size="large" :loading="loading" @click="del">删除</Button>
        <Button size="large" :loading="loading" @click="cancel">取消</Button>
      </Space>
    </template>
  </Modal>
</template>

<style scoped>

</style>