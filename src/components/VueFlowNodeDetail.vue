<script setup>
import {
  Card,
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
import {ref, reactive, computed, onMounted, inject} from "vue";
import Codemirror from "codemirror-editor-vue3";
import "codemirror/theme/yeti.css"
import jsonlint from "jsonlint-mod";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/addon/lint/lint.css";
import "codemirror/addon/lint/lint.js";
import "codemirror/addon/lint/json-lint";

import JSON5 from "json5";
import {fetchJson, getNode, listNode} from "@/components/electronAPI.js";

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
onMounted(async () => {
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
const targetEnv = inject("targetEnv");
const datasourceChoices = computed({
  get() {
    const list = targetEnv.value?.datasource || [];
    return list.map((item) => {
      return {
        value: item.value,
        label: item.label,
      }
    });
  }
})
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
const componentString = computed({
  get() {
    // 由于linter不支持JSON5，所以序列化为JSON
    return JSON.stringify(data.value.inference?.component || {}, null, 2);
  },
  set(newValue) {
    // 前端写入JSON5的字符串后可以成功解析为对象，但前端展示为JSON格式
    try {
      data.value.inference.component = JSON5.parse(newValue);
      jsonError.value = null;
    } catch (e) {
      jsonError.value = e.message;
    }
  }
});
const isSuccessExpression = computed({
  get() {
    return data.value?.inference?.success
  },
  set(newValue) {
    if (newValue === undefined || newValue === null || newValue === "") {
      data.value.inference.success = null;
    } else {
      data.value.inference.success = newValue;
    }
  }
})
const successExpressionSwitchOrigin = ref(false);
const successExpressionSwitch = computed({
  get() {
    return successExpressionSwitchOrigin.value;
  },
  set(newValue) {
    successExpressionSwitchOrigin.value = newValue;
    console.log(successExpressionSwitchOrigin.value);
    if (newValue === false) {
      isSuccessExpression.value = null;
    }
  }
})

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

async function appendRetrievers() {
  if (data.value.inference == null) {
    data.value.inference = {}
  }
  if (data.value.inference.retrievers == null) {
    data.value.inference.retrievers = []
  }
  data.value.inference.retrievers.push({
    datasource: null,
    query: null,
    sink: [],
  })
}

async function popRetrievers() {
  data.value.inference.retrievers.pop();
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
  <Modal v-model="props.active" width="720" :mask-closable="false">
    <template #header>
      <p style="text-align:center">
        <span>{{ props.header }}</span>
      </p>
    </template>
    <div>
      <Form :model="data" :rules="rules" :label-width="80">
        <FormItem prop="value" label="节点id"
                  :rules="[{ required: true, pattern: '^[a-zA-Z0-9]*$', message: '节点id不能为空，只能由字母数字组成', trigger: 'change' }]">
          <Space>
            <Input v-model="data.value" placeholder="inputNodeX" style="width: 300px"/>
            <Tooltip max-width="200" content="节点主键，请输入只包含字母数字的内容" placement="top">
              <Icon type="ios-help-circle"/>
            </Tooltip>
          </Space>
        </FormItem>
        <FormItem prop="label" label="节点名称"
                  :rules="[{ required: true, pattern: '^[a-zA-Z0-9\u4E00-\u9FFF-]*$', message: '节点名称不能为空,且不包含-以外的特殊符号', trigger: 'change' }]">
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
              <Button type="dashed" icon="md-add" @click="appendRetrievers">新增读写</Button>
            </Col>
            <Col span="6">
              <Button type="error" icon="md-trash" @click="popRetrievers" v-if="data.inference?.retrievers?.length > 0">删除读写</Button>
            </Col>
          </Row>
        </FormItem>
        <Space direction="vertical">
          <template v-for="(retriever, i1) in data.inference.retrievers">
            <Card>
              <FormItem label="数据源" :prop="'inference.retrievers.' + i1 + '.datasource'"
                        :rules="[{ required: true, message: '数据源不能为空', trigger: 'change' }]">
                <Space>
                  <Select v-model="retriever.datasource" style="width: 300px">
                    <Option v-for="(option, index) in datasourceChoices" :value="option.value" :key="index">{{option.label}}</Option>
                  </Select>
                  <Tooltip max-width="200" content="配置文件中当前环境的数据源(MYSQL/REDIS/...)" placement="top">
                    <Icon type="ios-help-circle"/>
                  </Tooltip>
                </Space>
              </FormItem>
              <FormItem label="查询语句" :prop="'inference.retrievers.' + i1 + '.query'">
                <Space>
                  <Input v-model="retriever.query" style="width:400px" type="textarea"
                         placeholder="SELECT CAST(id AS CHAR) AS value, CONCAT('标签', string_field) AS label FROM my_table WHERE `key` = ?"/>
                  <Tooltip max-width="200" content="用`?`替换变量的查询语句" placement="top">
                    <Icon type="ios-help-circle"/>
                  </Tooltip>
                </Space>
              </FormItem>
              <FormItem label="查询参数" :prop="'inference.retrievers.' + i1 + '.queryParams'">
                <Space>
                  <Select v-model="retriever.queryParams" multiple style="width:300px" filterable allow-create/>
                  <Tooltip max-width="200" content="变量名称或表达式， 如ctx.inputModule1.selection 或1+1" placement="top">
                    <Icon type="ios-help-circle"/>
                  </Tooltip>
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
            </Card>
          </template>
        </Space>
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
        <FormItem prop="inference.success" label="是否成功">
          <Space>
            <Switch size="large" true-color="#ffa000" false-color="#02ba00" v-model="successExpressionSwitch" >
              <template #open>
                <span>公式</span>
              </template>
              <template #close>
                <span>总是</span>
              </template>
            </Switch>
            <Input style="width: 400px" v-if="successExpressionSwitch" v-model="isSuccessExpression" placeholder="1 + 1 === 2 或 ctx.currentNode.a.b === 'something'"/>
            <Icon type="ios-help-circle"/>
          </Space>
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