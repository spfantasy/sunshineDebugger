<script setup>
import {nextTick, inject, ref, onMounted, computed} from 'vue'
import { VueFlow, useVueFlow, Panel } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { ControlButton, Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/controls/dist/style.css';
import '@vue-flow/minimap/dist/style.css';
import '@vue-flow/node-resizer/dist/style.css';
import {Drawer, Message, Space, Icon} from "view-ui-plus";
import DynamicComponent from "@/components/DynamicComponent.vue";
import JSON5 from 'json5';
import VueFlowInputNode from "@/components/VueFlowInputNode.vue";
import { useLayout } from './VueFlowShuffle.js'
import VueFlowOutputNode from "@/components/VueFlowOutputNode.vue";
import VueFlowNodeDetail from "@/components/VueFlowNodeDetail.vue";
import {listNode} from "@/components/electronAPI.js";

const { onInit, onNodeDragStop, addNodes, addEdges, removeNodes, removeEdges, setViewport, toObject, fitView, updateNode } = useVueFlow()
const { layout } = useLayout();

const nodes = ref([]);
const edges = ref([]);
const targetEnv = inject("targetEnv");
const openDetail = ref(false);
const drawerData = ref({});
const ctx = ref({});
const query = ref({});
const env = inject("env");
const focus = ref("");
const focusList = ref([])
const focusValue = computed({
  get() {
    return focus.value?.value || "";
  }
});
const nodeSearching = ref(false);
const rendering = ref(false);
const detailActive = ref(false);
const detailData = ref({});
// const dark = ref(false)

/**
 * This is a Vue Flow event-hook which can be listened to from anywhere you call the composable, instead of only on the main component
 * Any event that is available as `@event-name` on the VueFlow component is also available as `onEventName` on the composable and vice versa
 *
 * onInit is called when the VueFlow viewport is initialized
 */
onInit((vueFlowInstance) => {
  // instance is the same as the return of `useVueFlow`
  vueFlowInstance.fitView()
})

onMounted(renderFlow);
/**
 * onNodeDragStop is called when a node is done being dragged
 *
 * Node drag events provide you with:
 * 1. the event object
 * 2. the nodes array (if multiple nodes are dragged)
 * 3. the node that initiated the drag
 * 4. any intersections with other nodes
 */
onNodeDragStop(({ event, nodes, node }) => {
  console.log('Node Drag Stop', { event, nodes, node })
})


/**
 * To update a node or multiple nodes, you can
 * 1. Mutate the node objects *if* you're using `v-model`
 * 2. Use the `updateNode` method (from `useVueFlow`) to update the node(s)
 * 3. Create a new array of nodes and pass it to the `nodes` ref
 */
function updatePos() {
  nodes.value = nodes.value.map((node) => {
    return {
      ...node,
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
    }
  })
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * toObject transforms your current graph data to an easily persist-able object
 */
async function renderFlow() {
  try {
    nodes.value.forEach(node => {
      if (node.data.locked === true) {
        query.value[node.id] = node.data.selection;
      }
    })
    console.log("render flow query="+JSON5.stringify(query.value));
    removeNodes(nodes.value);
    removeEdges(edges.value);
    ctx.value = await window.electron.fetchData("renderFlow", {
      "env": targetEnv.value.value,
      "query": JSON5.stringify(query.value),
      "focus": focus.value.value,
    });
    addNodes(ctx.value.nodes);
    addEdges(ctx.value.edges);
    query.value = {};
    // update node position
    const positions = layout(ctx.value.nodes, ctx.value.edges);
    positions.forEach(p => {
      updateNode(p.id, {position: p.position});
    })
    await nextTick(() => {
      fitView({maxZoom: 2, minZoom: 0.2})
    })
  } catch (error) {
    console.error(error.message);
    Message.error(error.message);
  }
}

async function renderFlowAPI() {
  rendering.value = true;
  const minDurationPromise = sleep(1000);
  await Promise.all([renderFlow(), minDurationPromise]);
  rendering.value = false;
}

async function searchFocusNode(keyword) {
  try {
    nodeSearching.value = true;
    focusList.value = await listNode(keyword);
    nodeSearching.value = false;
  } catch (error) {
    nodeSearching.value = false;
    console.error(error.message);
    Message.error(error.message);
  }
}

function updateFocus(value) {
  focus.value = value;
  console.log(focus.value);
}

function renderDrawer(data) {
  if (data != null) {
    drawerData.value = data;
    openDetail.value = true;
  }
}

function logToObject() {
  console.log(toObject())
}

/**
 * Resets the current viewport transformation (zoom & pan)
 */
function resetTransform() {
  setViewport({ x: 0, y: 0, zoom: 1 })
}

function addNode() {
  detailData.value = {};
  detailActive.value = true;
}

function modifyNode() {
  detailData.value = {};
  detailActive.value = true;
}

</script>

<template>
  <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      class="biz-flow"
      :default-viewport="{ zoom: 1.5 }"
      :min-zoom="0.2"
      :max-zoom="4"
  >
    <Background pattern-color="#aaa" :gap="16" />

    <template #node-input="props">
      <VueFlowInputNode :id="props.id" :data="props.data"/>
    </template>
    <template #node-output="props">
      <VueFlowOutputNode :id="props.id" :data="props.data" @render-component="renderDrawer"/>
    </template>
    <Controls position="top-left">
      <ControlButton title="DEBUG" @click="logToObject">
        <Icon type="ios-code-working" />
      </ControlButton>
      <ControlButton title="新增" @click="addNode">
        <Icon type="ios-add" />
      </ControlButton>
      <ControlButton title="修改" @click="modifyNode">
        <Icon type="ios-document-outline" />
      </ControlButton>
    </Controls>
    <Panel position="top-right">
      <Space>
        焦点：
        <Select @on-select="updateFocus" :remote-method="searchFocusNode" :loading="nodeSearching" filterable
                prefix="ios-locate-outline" style="width:300px; text-align:left" clearable>
          <Option v-for="item of focusList" :value="item.value" :label="item.label" :key="item.value">
            <span>{{ item.label }}</span>
            <span style="float:right;color:#ccc">{{ item.value }}</span>
          </Option>
        </Select>
      </Space>
    </Panel>
    <Panel position="top-center">
      <Button size="large" type="primary" shape="circle" icon="ios-search" @click=renderFlowAPI :loading="rendering" />
    </Panel>
  </VueFlow>
  <Drawer :closable="false" width="640" v-model="openDetail">
    <DynamicComponent :componentData="drawerData"></DynamicComponent>
  </Drawer>
  <VueFlowNodeDetail :node-value="focusValue" :active="detailActive"
                     :allow-cancel="true" :allow-delete="true"
                     :allow-submit="true" header="testing" />
</template>
<style>
/* 小地图 */
.vue-flow__minimap {
  transform: scale(75%);
  transform-origin: bottom right;
}
/* 连接点 */
.vue-flow__handle {
  height:10px;
  width:24px;
  background:#aaa;
  border-radius:4px
}
/* node */
.vue-flow__node {
  background-color:#f3f4f6
}
/* 输入类node */
.vue-flow__node-input {
  gap:8px;
  padding: 20px 5px;
  border-radius:8px;
  box-shadow:0 0 10px #0003
}

.vue-flow__node-input.selected {
  box-shadow:0 0 0 2px !important;
}


</style>